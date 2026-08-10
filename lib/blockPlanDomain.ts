import { unresolveCourseAlias } from '@/constants/CourseAliases';
import {
  inclusiveDayCount,
  todayInBerlin,
  type YmdDate,
} from '@/lib/berlinDate';

export const PHASE_TYPES = ['THEORY', 'PRACTICE'] as const;
export type PhaseType = (typeof PHASE_TYPES)[number];

export interface BlockPlanPhase {
  type: PhaseType;
  startDate: YmdDate;
  endDate: YmdDate;
}

export interface BlockPlanSemester {
  number: number;
  phases: BlockPlanPhase[];
}

export interface BlockPlanCourse {
  /**
   * Not rendered anywhere; kept as the payload's sanity check, since a plan
   * without a course code cannot be attributed to anything.
   */
  code: string;
}

export interface BlockPlan {
  course: BlockPlanCourse;
  semesters: BlockPlanSemester[];
  /**
   * True when the payload contained phases or semesters the parser had to drop.
   * A study plan with a silently missing phase is worse than a visibly
   * incomplete one, so this travels all the way to the UI.
   */
  isPartial: boolean;
}

export interface BlockPlanPhaseRef {
  semesterNumber: number;
  phase: BlockPlanPhase;
}

export function toBlockPlanCourseCode(course: string): string {
  return unresolveCourseAlias(course).toUpperCase();
}

export function isBlockPlanPhaseType(value: unknown): value is PhaseType {
  return (
    typeof value === 'string' &&
    PHASE_TYPES.some((phaseType) => phaseType === value)
  );
}

export function getPhaseDurationDays(phase: BlockPlanPhase): number {
  return inclusiveDayCount(phase.startDate, phase.endDate);
}

/**
 * Every phase of the plan in chronological order.
 *
 * The parser only sorts semesters by number and phases within a semester, so
 * the flattened list is not chronological on its own. `findNextPhase` and
 * `isBeforeFirstPhase` read it positionally and would answer with the wrong
 * phase if a payload ever numbered its semesters out of order.
 */
export function getAllPhases(plan: BlockPlan): BlockPlanPhaseRef[] {
  return plan.semesters
    .flatMap((semester) =>
      semester.phases.map((phase) => ({
        semesterNumber: semester.number,
        phase,
      }))
    )
    .sort((a, b) => a.phase.startDate.localeCompare(b.phase.startDate));
}

export function isPhaseActiveOn(phase: BlockPlanPhase, day: YmdDate): boolean {
  return phase.startDate <= day && day <= phase.endDate;
}

export function findCurrentPhase(
  plan: BlockPlan,
  day: YmdDate = todayInBerlin()
): BlockPlanPhaseRef | null {
  return (
    getAllPhases(plan).find((ref) => isPhaseActiveOn(ref.phase, day)) ?? null
  );
}

export function findNextPhase(
  plan: BlockPlan,
  day: YmdDate = todayInBerlin()
): BlockPlanPhaseRef | null {
  return getAllPhases(plan).find((ref) => ref.phase.startDate > day) ?? null;
}

/**
 * True only before the very first phase. Distinguishes "the programme has not
 * started" from a gap between two phases, which looks identical to
 * `findCurrentPhase` returning null.
 */
export function isBeforeFirstPhase(
  plan: BlockPlan,
  day: YmdDate = todayInBerlin()
): boolean {
  const first = getAllPhases(plan)[0];
  return first != null && day < first.phase.startDate;
}

export function getPhaseProgress(
  phase: BlockPlanPhase,
  day: YmdDate = todayInBerlin()
): { ratio: number; daysRemaining: number; daysTotal: number } | null {
  if (!isPhaseActiveOn(phase, day)) return null;

  const daysTotal = getPhaseDurationDays(phase);
  const daysElapsed = inclusiveDayCount(phase.startDate, day);
  const daysRemaining = inclusiveDayCount(day, phase.endDate);

  return { ratio: daysElapsed / daysTotal, daysRemaining, daysTotal };
}
