import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/no-filter-in-query", () => {
  it("flags a db .filter using q.field", () => {
    const code = `const r = await ctx.db.query("t").filter((q) => q.eq(q.field("a"), 1)).collect();`;
    const d = lint({ code, ruleId: "no-filter-in-query" });
    expect(d).toHaveLength(1);
  });

  it("ignores a plain array .filter", () => {
    const code = `const r = [1, 2, 3].filter((n) => n > 1);`;
    const d = lint({ code, ruleId: "no-filter-in-query" });
    expect(d).toHaveLength(0);
  });
});
