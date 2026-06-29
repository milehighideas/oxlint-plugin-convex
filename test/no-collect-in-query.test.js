import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/no-collect-in-query", () => {
  it("flags ctx.db.query(...).collect()", () => {
    const code = `const r = await ctx.db.query("t").withIndex("by_x", (q) => q.eq("x", 1)).collect();`;
    const d = lint({ code, ruleId: "no-collect-in-query" });
    expect(d).toHaveLength(1);
  });

  it("ignores a non-db .collect()", () => {
    const code = `const r = stream.collect();`;
    const d = lint({ code, ruleId: "no-collect-in-query" });
    expect(d).toHaveLength(0);
  });
});
