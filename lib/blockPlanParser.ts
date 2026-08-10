import { isValidYmd } from '@/lib/berlinDate';
import {
  isBlockPlanPhaseType,
  type BlockPlan,
  type BlockPlanPhase,
  type BlockPlanSemester,
} from '@/lib/blockPlanDomain';
import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';

/**
 * Collects whether anything had to be thrown away. Dropping a single bad phase
 * beats losing the whole plan, but the loss must not stay invisible: it ends up
 * as `BlockPlan.isPartial` and is shown to the user.
 */
interface ParseContext {
  dropped: boolean;
}

/**
 * Returned by an entry parser for something that is legitimately absent rather
 * than broken. `parseList` leaves it out without recording a loss, which keeps
 * the "incomplete" warning for payloads that really lost data.
 */
const SKIP = Symbol('skip');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePhase(raw: unknown): BlockPlanPhase | null {
  if (!isRecord(raw)) return null;
  const { type, startDate, endDate } = raw;
  if (!isBlockPlanPhaseType(type)) return null;
  if (!isValidYmd(startDate) || !isValidYmd(endDate)) return null;
  if (endDate < startDate) return null;

  return { type, startDate, endDate };
}

/** Reads a list, keeping the entries that parse and recording the ones that do not. */
function parseList<T>(
  rawList: unknown,
  parse: (raw: unknown) => T | null | typeof SKIP,
  context: ParseContext
): T[] {
  if (!Array.isArray(rawList)) {
    // An absent list is a shape we accept; anything else is a real loss.
    if (rawList !== undefined) context.dropped = true;
    return [];
  }

  const parsed: T[] = [];
  for (const raw of rawList) {
    const item = parse(raw);
    if (item === SKIP) continue;
    if (item === null) {
      context.dropped = true;
    } else {
      parsed.push(item);
    }
  }
  return parsed;
}

function parseSemester(
  raw: unknown,
  context: ParseContext
): BlockPlanSemester | null | typeof SKIP {
  if (!isRecord(raw)) return null;
  const number = Number(raw.number);
  if (!Number.isInteger(number) || number <= 0) return null;

  const droppedBefore = context.dropped;
  const phases = parseList(raw.phases, parsePhase, context).sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  if (phases.length === 0) {
    // A semester whose phases are not scheduled yet is a plan still being
    // filled in, not a loss — warning about it would cry wolf. It only counts
    // as dropped when parsing its phases actually failed.
    return context.dropped === droppedBefore ? SKIP : null;
  }
  return { number, phases };
}

export function parseBlockPlan(raw: unknown): BlockPlan {
  if (!isRecord(raw)) {
    throw new BlockPlanError(BlockPlanErrorCode.Parse);
  }

  const rawCourse = isRecord(raw.course) ? raw.course : undefined;
  const code = typeof rawCourse?.code === 'string' ? rawCourse.code.trim() : '';
  if (!code) {
    throw new BlockPlanError(BlockPlanErrorCode.Parse);
  }

  const context: ParseContext = { dropped: false };
  const semesters = parseList(
    raw.semesters,
    (rawSemester) => parseSemester(rawSemester, context),
    context
  ).sort((a, b) => a.number - b.number);

  if (semesters.length === 0) {
    throw new BlockPlanError(BlockPlanErrorCode.Parse);
  }

  // A plan re-read from the cache was already cleaned up on the way in, so
  // nothing gets dropped a second time. Carrying the stored flag over keeps the
  // "incomplete" warning alive across restarts and offline starts, where it
  // matters most. The API itself never sends this field.
  const wasPartial = raw.isPartial === true;

  return {
    course: { code },
    semesters,
    isPartial: context.dropped || wasPartial,
  };
}
