import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/no-api-imports", () => {
  it("flags importing `api` from _generated/api", () => {
    const code = `import { api } from "./_generated/api";\nconst x = api;`;
    const d = lint({ code, ruleId: "no-api-imports" });
    expect(d).toHaveLength(1);
  });

  it("allows importing `internal` from _generated/api", () => {
    const code = `import { internal } from "./_generated/api";\nconst x = internal;`;
    const d = lint({ code, ruleId: "no-api-imports" });
    expect(d).toHaveLength(0);
  });
});
