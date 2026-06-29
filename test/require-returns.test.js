import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/require-returns", () => {
  it("flags a public query missing returns:", () => {
    const code = `export const list = query({ args: {}, handler: async () => [] });`;
    const d = lint({ code, ruleId: "require-returns" });
    expect(d).toHaveLength(1);
    expect(d[0].message).toMatch(/returns:/);
  });

  it("passes when returns: is present", () => {
    const code = `export const list = query({ args: {}, returns: v.array(v.any()), handler: async () => [] });`;
    const d = lint({ code, ruleId: "require-returns" });
    expect(d).toHaveLength(0);
  });

  it("ignores internal functions", () => {
    const code = `export const helper = internalQuery({ args: {}, handler: async () => 1 });`;
    const d = lint({ code, ruleId: "require-returns" });
    expect(d).toHaveLength(0);
  });
});
