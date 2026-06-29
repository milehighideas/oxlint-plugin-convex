import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

const fn = (n) =>
  `export const f${n} = mutation({ args: {}, returns: v.null(), handler: async () => null });`;
const opts = { crudDomains: ["vehicles"] };

describe("convex/crud-structure", () => {
  it("flags >1 registered function in a CRUD file", () => {
    const code = [fn(0), fn(1)].join("\n");
    const d = lint({ code, ruleId: "crud-structure", options: opts, filename: "vehicles/create/addVehicle.ts" });
    expect(d).toHaveLength(1);
    expect(d[0].message).toMatch(/one registered/i);
  });

  it("flags a registered function outside a CRUD folder", () => {
    const code = fn(0);
    const d = lint({ code, ruleId: "crud-structure", options: opts, filename: "vehicles/vehicleMutations.ts" });
    expect(d).toHaveLength(1);
    expect(d[0].message).toMatch(/create\/read\/update\/delete/);
  });

  it("passes one function in a CRUD folder", () => {
    const code = fn(0);
    const d = lint({ code, ruleId: "crud-structure", options: opts, filename: "vehicles/create/addVehicle.ts" });
    expect(d).toHaveLength(0);
  });

  it("no-ops for domains not in crudDomains", () => {
    const code = [fn(0), fn(1)].join("\n");
    const d = lint({ code, ruleId: "crud-structure", options: opts, filename: "events/eventsMutations.ts" });
    expect(d).toHaveLength(0);
  });
});
