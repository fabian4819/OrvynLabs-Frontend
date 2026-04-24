import { describe, it, expect } from "vitest";
import { formatDkt, cn } from "./utils";

describe("formatDkt", () => {
  it("formats bigint to decimal string", () => {
    // formatDkt converts from wei to DKT (18 decimals)
    const result = formatDkt(BigInt("1000000000000000000"));
    expect(result).toContain("1");
    expect(typeof result).toBe("string");
  });

  it("handles zero correctly", () => {
    const result = formatDkt(0n);
    expect(typeof result).toBe("string");
  });

  it("handles large numbers", () => {
    const result = formatDkt(BigInt("100000000000000000000"));
    expect(typeof result).toBe("string");
    expect(parseFloat(result)).toBeGreaterThan(0);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "conditional")).toBe("base conditional");
    expect(cn("base", false && "conditional")).toBe("base");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("works with no arguments", () => {
    expect(cn()).toBe("");
  });
});
