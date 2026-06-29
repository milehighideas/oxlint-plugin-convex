import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

const fn = (n) =>
  `export const f${n} = query({ args: {}, returns: v.null(), handler: async () => null });`;

describe("convex/max-functions", () => {
  it("flags more than maxFunctions registered functions", () => {
    const code = Array.from({ length: 4 }, (_, i) => fn(i)).join("\n");
    const d = lint({ code, ruleId: "max-functions", options: { maxFunctions: 3 } });
    expect(d).toHaveLength(1);
    expect(d[0].message).toMatch(/4 registered.*limit.*3/);
  });

  it("does not count plain exported helpers/validators", () => {
    const code = [fn(0), `export const fooValidator = v.object({});`, `export const X = 1;`].join("\n");
    const d = lint({ code, ruleId: "max-functions", options: { maxFunctions: 3 } });
    expect(d).toHaveLength(0);
  });
});
