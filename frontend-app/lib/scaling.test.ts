import { describe, expect, it } from "vitest";
import { formatAmount, scaleAmount } from "./scaling";

describe("formatAmount", () => {
  it("renders integers without decimals", () => {
    expect(formatAmount(3)).toBe("3");
    expect(formatAmount(0)).toBe("0");
  });

  it("rounds non-integers to 2 decimal places", () => {
    expect(formatAmount(0.6666666)).toBe("0.67");
    expect(formatAmount(1.234)).toBe("1.23");
  });

  it("trims trailing zeros via rounding", () => {
    expect(formatAmount(2.5)).toBe("2.5");
  });

  it("returns em-dash for non-finite values", () => {
    expect(formatAmount(NaN)).toBe("—");
    expect(formatAmount(Infinity)).toBe("—");
  });
});

describe("scaleAmount", () => {
  it("scales integer amounts", () => {
    expect(scaleAmount("2", 3)).toBe("6");
    expect(scaleAmount("4", 0.5)).toBe("2");
  });

  it("scales decimal amounts", () => {
    expect(scaleAmount("1.5", 2)).toBe("3");
    expect(scaleAmount("0.25", 4)).toBe("1");
  });

  it("scales fraction strings (e.g. 1/3)", () => {
    expect(scaleAmount("1/3", 2)).toBe("0.67");
    expect(scaleAmount("1/2", 4)).toBe("2");
  });

  it("tolerates whitespace around the fraction slash", () => {
    expect(scaleAmount("1 / 2", 2)).toBe("1");
  });

  it("returns the original string unchanged when factor is 1 and amount is non-numeric", () => {
    expect(scaleAmount("pinch", 1)).toBe("pinch");
    expect(scaleAmount("to taste", 1)).toBe("to taste");
  });

  it("falls back to '<original> ×<factor>' for non-numeric amounts when scaling", () => {
    expect(scaleAmount("pinch", 2)).toBe("pinch ×2");
    expect(scaleAmount("to taste", 1.5)).toBe("to taste ×1.5");
  });

  it("guards against divide-by-zero in fraction parsing (falls through to text fallback)", () => {
    expect(scaleAmount("1/0", 2)).toBe("1/0 ×2");
  });
});
