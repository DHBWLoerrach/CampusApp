import { parseBlockPlan } from '@/lib/blockPlanParser';
import { toBlockPlanCourseCode, type BlockPlan } from '@/lib/blockPlanDomain';
import { BlockPlanError, BlockPlanErrorCode } from '@/lib/blockPlanError';

const BLOCK_PLAN_API_ORIGIN = 'https://plan.apps.szi.dhbw-loerrach.de';

export const DEFAULT_BLOCK_PLAN_URL_TEMPLATE: string =
  (process.env.EXPO_PUBLIC_BLOCKPLAN_URL as string) ||
  `${BLOCK_PLAN_API_ORIGIN}/api/v1/courses/{course}/block-plan`;

/**
 * Builds the request URL for a course. Callers may pass either a raw or an
 * already normalized course; `toBlockPlanCourseCode` is idempotent, so
 * normalizing again here keeps every entry point safe on its own.
 */
export function buildBlockPlanUrl(
  course: string,
  template: string = DEFAULT_BLOCK_PLAN_URL_TEMPLATE
): string {
  return template.replace(
    '{course}',
    encodeURIComponent(toBlockPlanCourseCode(course))
  );
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

export async function getBlockPlan(
  course: string,
  signal?: AbortSignal
): Promise<BlockPlan> {
  if (!course.trim()) {
    throw new BlockPlanError(BlockPlanErrorCode.InvalidCourse);
  }

  let response: Response;
  try {
    response = await fetch(buildBlockPlanUrl(course), { signal });
  } catch (error) {
    if (isAbortError(error, signal)) throw error;
    console.warn('Block plan fetch failed:', error);
    throw new BlockPlanError(BlockPlanErrorCode.Network, { cause: error });
  }

  if (response.status === 404) {
    throw new BlockPlanError(BlockPlanErrorCode.NotFound, {
      status: response.status,
      statusText: response.statusText || undefined,
    });
  }
  if (!response.ok) {
    throw new BlockPlanError(BlockPlanErrorCode.Http, {
      status: response.status,
      statusText: response.statusText || undefined,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    // Reading the body can be cut short by the same abort that cancels the
    // request, which is not a malformed payload and must not be logged as one.
    if (isAbortError(error, signal)) throw error;
    console.warn('Block plan JSON parsing failed:', error);
    throw new BlockPlanError(BlockPlanErrorCode.Parse, { cause: error });
  }

  const plan = parseBlockPlan(payload);

  // A plan for the wrong course looks entirely plausible but would be cached
  // and shown under the requested one, so it is rejected rather than trusted.
  // Both sides are normalized because the API may answer with the alias form.
  const requested = toBlockPlanCourseCode(course);
  const delivered = toBlockPlanCourseCode(plan.course.code);
  if (delivered !== requested) {
    console.warn(
      `Block plan course mismatch: requested ${requested}, received ${delivered}`
    );
    throw new BlockPlanError(BlockPlanErrorCode.Parse);
  }

  return plan;
}
