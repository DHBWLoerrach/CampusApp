export enum BlockPlanErrorCode {
  InvalidCourse = 'INVALID_COURSE',
  NotFound = 'NOT_FOUND',
  Network = 'NETWORK',
  Http = 'HTTP',
  Parse = 'PARSE',
}

// Technical descriptions for logs and crash reports. User-facing wording lives
// in `components/schedule/blockPlanErrorMessage.ts`.
const MESSAGES: Record<BlockPlanErrorCode, string> = {
  [BlockPlanErrorCode.InvalidCourse]: 'No course was given',
  [BlockPlanErrorCode.NotFound]: 'The course has no block plan',
  [BlockPlanErrorCode.Network]: 'The block plan service is unreachable',
  [BlockPlanErrorCode.Http]: 'The block plan service returned an error',
  [BlockPlanErrorCode.Parse]: 'The block plan payload could not be parsed',
};

export class BlockPlanError extends Error {
  readonly status?: number;
  readonly statusText?: string;

  constructor(
    public readonly code: BlockPlanErrorCode,
    options?: {
      cause?: unknown;
      status?: number;
      statusText?: string;
    }
  ) {
    const status = options?.status;
    super(status ? `${MESSAGES[code]} (HTTP ${status})` : MESSAGES[code], {
      cause: options?.cause,
    });
    this.name = 'BlockPlanError';
    this.status = status;
    this.statusText = options?.statusText;
  }
}

/**
 * Narrowing helper for the places that only see a plain `Error` — an aborted
 * request rejects with the raw AbortError, so `error.code` cannot be read
 * without checking the type first.
 */
export function isBlockPlanErrorCode(
  error: unknown,
  code: BlockPlanErrorCode
): boolean {
  return error instanceof BlockPlanError && error.code === code;
}
