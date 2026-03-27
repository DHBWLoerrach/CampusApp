const mockGetItem = jest.fn();

jest.mock("expo-sqlite/kv-store", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: jest.fn(),
}));

import {
  getCodeCompanionPromoDismissed,
  getCodeCompanionPromoSeenCount,
  isCodeCompanionEligibleCourse,
} from "@/lib/codeCompanionPromo";

describe("isCodeCompanionEligibleCourse", () => {
  beforeEach(() => {
    mockGetItem.mockReset();
  });

  it("accepts supported course prefixes", () => {
    expect(isCodeCompanionEligibleCourse("TIF24A")).toBe(true);
    expect(isCodeCompanionEligibleCourse("wds23b")).toBe(true);
    expect(isCodeCompanionEligibleCourse("WWI26C")).toBe(true);
  });

  it("accepts known aliases after canonicalization", () => {
    expect(isCodeCompanionEligibleCourse("wwi25a")).toBe(true);
  });

  it("rejects unrelated courses", () => {
    expect(isCodeCompanionEligibleCourse("BWL24A")).toBe(false);
    expect(isCodeCompanionEligibleCourse("MKB22A")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isCodeCompanionEligibleCourse("")).toBe(false);
    expect(isCodeCompanionEligibleCourse("   ")).toBe(false);
    expect(isCodeCompanionEligibleCourse(null)).toBe(false);
    expect(isCodeCompanionEligibleCourse(undefined)).toBe(false);
  });

  it("treats a missing dismissed flag as not dismissed", async () => {
    mockGetItem.mockResolvedValueOnce(null);

    await expect(getCodeCompanionPromoDismissed()).resolves.toBe(false);
  });

  it("treats a missing seen counter as zero", async () => {
    mockGetItem.mockResolvedValueOnce(null);

    await expect(getCodeCompanionPromoSeenCount()).resolves.toBe(0);
  });
});
