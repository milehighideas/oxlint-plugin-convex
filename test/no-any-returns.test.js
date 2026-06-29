import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/no-any-returns", () => {
  it("flags returns: v.any()", () => {
    const code = `export const f = query({ args: {}, returns: v.any(), handler: async () => 1 });`;
    const d = lint({ code, ruleId: "no-any-returns" });
    expect(d).toHaveLength(1);
  });

  it("flags v.any() nested in v.union", () => {
    const code = `export const f = query({ args: {}, returns: v.union(v.null(), v.any()), handler: async () => 1 });`;
    const d = lint({ code, ruleId: "no-any-returns" });
    expect(d).toHaveLength(1);
  });

  it("passes a concrete returns validator", () => {
    const code = `export const f = query({ args: {}, returns: v.object({ id: v.string() }), handler: async () => ({ id: "x" }) });`;
    const d = lint({ code, ruleId: "no-any-returns" });
    expect(d).toHaveLength(0);
  });
});
