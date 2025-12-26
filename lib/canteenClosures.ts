import { format } from "date-fns";

// Minimal canteen closure configuration.
// Define a single inclusive date range. No single days, no lists.
// Example:
export const CANTEEN_CLOSED_FROM: string | null = "2025-08-01";
export const CANTEEN_CLOSED_THROUGH: string | null = "2025-09-14";
export const CANTEEN_CLOSED_REASON: string | undefined = "Sommerpause";

// export const CANTEEN_CLOSED_FROM: string | null = null;
// export const CANTEEN_CLOSED_THROUGH: string | null = null;
// export const CANTEEN_CLOSED_REASON: string | undefined = undefined;

export type ClosureInfo = { reason?: string };

export function getCanteenClosure(date: Date): ClosureInfo | null {
  const key = format(date, "yyyy-MM-dd");
  if (!CANTEEN_CLOSED_FROM || !CANTEEN_CLOSED_THROUGH) return null;
  if (key >= CANTEEN_CLOSED_FROM && key <= CANTEEN_CLOSED_THROUGH) {
    return { reason: CANTEEN_CLOSED_REASON };
  }
  return null;
}
