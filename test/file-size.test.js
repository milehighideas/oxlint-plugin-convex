import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/file-size", () => {
  it("flags a file over maxLines", () => {
    const code = Array.from({ length: 12 }, (_, i) => `const x${i} = ${i};`).join("\n");
    const d = lint({ code, ruleId: "file-size", options: { maxLines: 10 } });
    expect(d).toHaveLength(1);
    expect(d[0].message).toMatch(/12 lines.*limit.*10/);
  });

  it("passes a file at/under maxLines", () => {
    const code = "const a = 1;\nconst b = 2;";
    const d = lint({ code, ruleId: "file-size", options: { maxLines: 10 } });
    expect(d).toHaveLength(0);
  });
});
