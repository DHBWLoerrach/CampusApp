import { resolveCourseAlias } from '@/constants/CourseAliases';
import {
  parseIcal,
  structureEventsByDay,
  type StructuredTimetable,
} from './icalParser';

export type { TimetableEvent, StructuredTimetable } from './icalParser';

export enum CalendarErrorCode {
  InvalidCourse = 'INVALID_COURSE',
  Network = 'NETWORK',
  Http = 'HTTP',
  Parse = 'PARSE',
  LimitExceeded = 'LIMIT_EXCEEDED',
}

export class CalendarError extends Error {
  constructor(
    public readonly code: CalendarErrorCode,
    options?: {
      cause?: unknown;
      status?: number;
      statusText?: string;
    }
  ) {
    super(code, { cause: options?.cause });
    this.name = 'CalendarError';
    this.status = options?.status;
    this.statusText = options?.statusText;
  }

  readonly status?: number;
  readonly statusText?: string;
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

// Defensive limits to prevent client-side DoS from malformed or adversarial ICS feeds.
// Allows safe RFC-5321 mailbox characters (alphanumerics, '-', '_', '+', single '.')
// while rejecting path traversal ('..', '/'), query/fragment ('?', '#'), and '@'.
const VALID_COURSE_REGEX =
  /^[a-z0-9](?:(?:[a-z0-9_+-]|\.(?!\.)){0,62}[a-z0-9_+-])?$/;
const VALIDATE_COURSE_TIMEOUT_MS = 10_000;
const MAX_ICAL_BYTES = 15 * 1024 * 1024; // 15 MiB

/**
 * Resolves course aliases, normalizes to lowercase, and verifies the course code
 * only contains safe mailbox characters (preventing URL path/query/fragment injection).
 */
function normalizeAndValidateCourse(course: string): string | null {
  if (!course) return null;
  const canonical = resolveCourseAlias(course).toLowerCase();
  if (!VALID_COURSE_REGEX.test(canonical)) return null;
  return canonical;
}

/**
 * Generates the iCal URL for an already validated canonical course code.
 */
function generateIcalUrl(canonicalCourse: string): string {
  return `https://webmail.dhbw-loerrach.de/owa/calendar/kal-${encodeURIComponent(canonicalCourse)}@dhbw-loerrach.de/Kalender/calendar.ics`;
}

/**
 * Validates if a course exists by checking if the iCal URL is accessible.
 */
export async function validateCourse(course: string): Promise<boolean> {
  const canonical = normalizeAndValidateCourse(course);
  if (!canonical) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    VALIDATE_COURSE_TIMEOUT_MS
  );

  try {
    const icalUrl = generateIcalUrl(canonical);
    const response = await fetch(icalUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.warn('Course validation failed:', error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Reads a response body as UTF-8 text while enforcing a strict byte limit.
 * When the runtime exposes a ReadableStream body (e.g. Expo's winter fetch),
 * bytes are counted incrementally and the download is aborted as soon as the
 * limit is exceeded. Falls back to measuring UTF-8 bytes after `response.text()`
 * when no stream is available (e.g. minimal test mocks).
 */
async function readResponseTextWithinLimit(
  response: Response,
  maxBytes: number,
  onLimitExceeded: () => void
): Promise<string> {
  const body = response.body;
  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let totalBytes = 0;
    const chunks: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          onLimitExceeded();
          await reader.cancel().catch(() => {});
          throw new CalendarError(CalendarErrorCode.LimitExceeded);
        }

        chunks.push(decoder.decode(value, { stream: true }));
      }

      chunks.push(decoder.decode());
      return chunks.join('');
    } finally {
      reader.releaseLock();
    }
  }

  const text = await response.text();
  if (utf8ByteLength(text) > maxBytes) {
    onLimitExceeded();
    throw new CalendarError(CalendarErrorCode.LimitExceeded);
  }
  return text;
}

/**
 * Fetches the raw iCal data from the specified URL for a validated canonical course.
 */
async function fetchRawIcalData(
  canonicalCourse: string,
  signal?: AbortSignal
): Promise<string> {
  const icalUrl = generateIcalUrl(canonicalCourse);
  const controller = new AbortController();
  const onCallerAbort = () => controller.abort();
  let exceededSizeLimit = false;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  const abortForSizeLimit = () => {
    exceededSizeLimit = true;
    controller.abort();
  };

  try {
    const response = await fetch(icalUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new CalendarError(CalendarErrorCode.Http, {
        status: response.status,
        statusText: response.statusText || undefined,
      });
    }
    const contentLengthHeader = response.headers?.get('content-length');
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_ICAL_BYTES) {
        abortForSizeLimit();
        await response.body?.cancel?.().catch(() => {});
        throw new CalendarError(CalendarErrorCode.LimitExceeded);
      }
    }
    return await readResponseTextWithinLimit(
      response,
      MAX_ICAL_BYTES,
      abortForSizeLimit
    );
  } catch (error) {
    if (error instanceof CalendarError) throw error;
    if (exceededSizeLimit) {
      throw new CalendarError(CalendarErrorCode.LimitExceeded, {
        cause: error,
      });
    }
    if (isAbortError(error, signal)) throw error;
    console.warn('Calendar fetch failed:', error);
    throw new CalendarError(CalendarErrorCode.Network, { cause: error });
  } finally {
    signal?.removeEventListener('abort', onCallerAbort);
  }
}
export interface TimetableResult {
  days: StructuredTimetable;
  incomplete: boolean;
}

/**
 * Orchestrator – fetches, parses and structures the course timetable for a specific course.
 */
export async function getStructuredTimetable(
  course: string,
  signal?: AbortSignal
): Promise<TimetableResult> {
  const canonical = normalizeAndValidateCourse(course);
  if (!canonical) {
    throw new CalendarError(CalendarErrorCode.InvalidCourse);
  }

  const raw = await fetchRawIcalData(canonical, signal);
  try {
    const { events, incomplete } = parseIcal(raw);
    return { days: structureEventsByDay(events), incomplete };
  } catch (error) {
    if (error instanceof CalendarError) throw error;
    console.warn('Calendar parsing failed:', error);
    throw new CalendarError(CalendarErrorCode.Parse, { cause: error });
  }
}
