import Storage from 'expo-sqlite/kv-store';
import { BLOCK_PLAN_CACHE_KEY_PREFIX } from '@/constants/StorageKeys';
import { toBlockPlanCourseCode, type BlockPlan } from '@/lib/blockPlanDomain';
import { parseBlockPlan } from '@/lib/blockPlanParser';

// Normalizes again on purpose: `toBlockPlanCourseCode` is idempotent, and this
// guarantees one key per course no matter how the caller spells it.
function cacheKey(course: string): string {
  return `${BLOCK_PLAN_CACHE_KEY_PREFIX}${toBlockPlanCourseCode(course)}`;
}

/**
 * Whether a plan actually belongs to the course it is filed under. A plan for
 * the wrong course looks entirely plausible on screen, so neither side of the
 * cache takes the key's word for it — the stored copy is what an offline start
 * renders, and it outlives the app version that wrote it.
 */
function belongsToCourse(plan: BlockPlan, course: string): boolean {
  return (
    toBlockPlanCourseCode(plan.course.code) === toBlockPlanCourseCode(course)
  );
}

export async function readCachedBlockPlan(
  course: string
): Promise<BlockPlan | undefined> {
  if (!course.trim()) return undefined;

  const key = cacheKey(course);
  try {
    const raw = await Storage.getItem(key);
    if (!raw) return undefined;

    const plan = parseBlockPlan(JSON.parse(raw));
    if (!belongsToCourse(plan, course)) {
      // Only reachable from a corrupted store or a version that cached without
      // this check. Dropping it beats showing another course's dates offline.
      console.warn(
        `Discarding cached block plan for ${plan.course.code} stored under ${toBlockPlanCourseCode(course)}`
      );
      await Storage.removeItem(key);
      return undefined;
    }
    return plan;
  } catch (error) {
    console.warn('Failed to read cached block plan:', error);
    return undefined;
  }
}

export async function writeCachedBlockPlan(
  course: string,
  plan: BlockPlan
): Promise<void> {
  if (!course.trim()) return;

  if (!belongsToCourse(plan, course)) {
    console.warn(
      `Refusing to cache block plan for ${plan.course.code} under ${toBlockPlanCourseCode(course)}`
    );
    return;
  }

  try {
    await Storage.setItem(cacheKey(course), JSON.stringify(plan));
  } catch (error) {
    console.warn('Failed to cache block plan:', error);
  }
}

export async function clearCachedBlockPlan(course: string): Promise<void> {
  if (!course.trim()) return;

  try {
    await Storage.removeItem(cacheKey(course));
  } catch (error) {
    console.warn('Failed to clear cached block plan:', error);
  }
}
