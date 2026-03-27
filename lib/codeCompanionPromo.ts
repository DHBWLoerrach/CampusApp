import Storage from 'expo-sqlite/kv-store';
import { resolveCourseAlias } from '@/constants/CourseAliases';
import {
  CODE_COMPANION_PROMO_DISMISSED_KEY,
  CODE_COMPANION_PROMO_SEEN_COUNT_KEY,
} from '@/constants/StorageKeys';

const CODE_COMPANION_ELIGIBLE_PREFIXES = ['TIF', 'WDS', 'WWI'] as const;
export const CODE_COMPANION_PROMO_HIDE_FOREVER_THRESHOLD = 2;

export const CODE_COMPANION_ANDROID_URL =
  'https://play.google.com/store/apps/details?id=de.dhbwloe.loerrach.CodeCompanion';
export const CODE_COMPANION_IOS_URL =
  'https://apps.apple.com/app/dhbw-code-companion/id6758941958';

export const CODE_COMPANION_FEATURES = [
  'Lernpfade mit kurzen Erklärungen',
  'KI-Quizfragen zum Üben und Wiederholen',
  'Lernfortschritt mit Levels und Mastery je Thema',
] as const;

export function isCodeCompanionEligibleCourse(
  course: string | null | undefined,
): boolean {
  if (!course?.trim()) {
    return false;
  }

  const canonicalCourse = resolveCourseAlias(course).trim().toUpperCase();
  return CODE_COMPANION_ELIGIBLE_PREFIXES.some((prefix) =>
    canonicalCourse.startsWith(prefix),
  );
}

function parseCodeCompanionPromoSeenCount(raw: string | null): number {
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function getCodeCompanionPromoDismissed(): Promise<boolean> {
  const savedDismissed = await Storage.getItem(
    CODE_COMPANION_PROMO_DISMISSED_KEY,
  );
  return savedDismissed === '1';
}

export async function dismissCodeCompanionPromo(): Promise<void> {
  await Storage.setItem(CODE_COMPANION_PROMO_DISMISSED_KEY, '1');
}

export async function getCodeCompanionPromoSeenCount(): Promise<number> {
  return parseCodeCompanionPromoSeenCount(
    await Storage.getItem(CODE_COMPANION_PROMO_SEEN_COUNT_KEY),
  );
}

export async function incrementCodeCompanionPromoSeenCount(): Promise<number> {
  let next = 1;

  await Storage.setItem(CODE_COMPANION_PROMO_SEEN_COUNT_KEY, (prevValue) => {
    next = parseCodeCompanionPromoSeenCount(prevValue) + 1;
    return String(next);
  });

  return next;
}
