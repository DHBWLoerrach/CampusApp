import { isCodeCompanionEligibleCourse } from "@/lib/codeCompanionPromo";

describe("isCodeCompanionEligibleCourse", () => {
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
});
