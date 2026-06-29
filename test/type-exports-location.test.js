import { describe, it, expect } from "vitest";
import { lint } from "./harness.js";

describe("convex/type-exports-location", () => {
  it("flags a type export outside types/", () => {
    const code = `export type Foo = { a: number };`;
    const d = lint({ code, ruleId: "type-exports-location", filename: "vehicles/vehicleQueries.ts" });
    expect(d).toHaveLength(1);
  });

  it("flags an interface export outside types/", () => {
    const code = `export interface Bar { a: number }`;
    const d = lint({ code, ruleId: "type-exports-location", filename: "vehicles/vehicleQueries.ts" });
    expect(d).toHaveLength(1);
  });

  it("allows type exports inside a types/ folder", () => {
    const code = `export type Foo = { a: number };`;
    const d = lint({ code, ruleId: "type-exports-location", filename: "vehicles/types/foo.ts" });
    expect(d).toHaveLength(0);
  });

  it("does not flag exported validators (const values)", () => {
    const code = `export const fooValidator = v.object({});`;
    const d = lint({ code, ruleId: "type-exports-location", filename: "vehicles/vehicleQueries.ts" });
    expect(d).toHaveLength(0);
  });
});
