import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { YmdDate } from '@/lib/berlinDate';
import type { BlockPlanPhase, PhaseType } from '@/lib/blockPlanDomain';

type PhaseDisplay = {
  label: string;
  /** SF Symbol name; mapped to Material icons on Android/web by IconSymbol. */
  icon: 'graduationcap' | 'briefcase';
};

const PHASE_DISPLAY: Record<PhaseType, PhaseDisplay> = {
  THEORY: { label: 'Theoriephase', icon: 'graduationcap' },
  PRACTICE: { label: 'Praxisphase', icon: 'briefcase' },
};

export function getPhaseDisplay(type: PhaseType): PhaseDisplay {
  return PHASE_DISPLAY[type];
}

/** Formats a single day in German, e.g. "27. Sep. 2027". */
export function formatDay(day: YmdDate): string {
  return format(parseISO(day), 'd. MMM yyyy', { locale: de });
}

/**
 * Formats a phase as a German date range, dropping the redundant year on the
 * start date when both dates fall into the same year.
 * Example: "27. Sep. – 19. Dez. 2027"
 */
export function formatPhaseRange(phase: BlockPlanPhase): string {
  const start = parseISO(phase.startDate);
  const end = parseISO(phase.endDate);
  const sameYear = phase.startDate.slice(0, 4) === phase.endDate.slice(0, 4);

  const startText = format(start, sameYear ? 'd. MMM' : 'd. MMM yyyy', {
    locale: de,
  });
  const endText = format(end, 'd. MMM yyyy', { locale: de });

  return `${startText} – ${endText}`;
}

/** Duration as a short German label, e.g. "12 Wochen" or "5 Tage". */
export function formatPhaseDuration(days: number): string {
  if (days < 14) {
    return days === 1 ? '1 Tag' : `${days} Tage`;
  }

  const weeks = Math.round(days / 7);
  return `${weeks} Wochen`;
}

/** Remaining time of the current phase, e.g. "noch 3 Wochen". */
export function formatRemaining(daysRemaining: number): string {
  if (daysRemaining <= 1) return 'letzter Tag';
  if (daysRemaining < 14) return `noch ${daysRemaining} Tage`;

  const weeks = Math.round(daysRemaining / 7);
  return `noch ${weeks} Wochen`;
}
