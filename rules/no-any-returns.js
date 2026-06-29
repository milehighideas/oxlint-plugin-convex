import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";
import { REGISTRABLE, findReturnsProperty } from "../lib/convex-ast.js";

function isVAny(node) {
  return (
    node?.type === "CallExpression" &&
    node.callee?.type === "MemberExpression" &&
    node.callee.object?.name === "v" &&
    node.callee.property?.name === "any"
  );
}

// Recursively look for v.any() within the returns validator expression
// (covers v.union(...), v.object({...}), v.array(...), etc.).
function containsVAny(node) {
  if (!node || typeof node !== "object") return false;
  if (isVAny(node)) return true;
  for (const key of Object.keys(node)) {
    if (key === "parent" || key === "loc" || key === "range") continue;
    const val = node[key];
    if (Array.isArray(val)) {
      if (val.some((c) => c && typeof c.type === "string" && containsVAny(c))) return true;
    } else if (val && typeof val.type === "string") {
      if (containsVAny(val)) return true;
    }
  }
  return false;
}

export default {
  meta: { type: "problem" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee?.type !== "Identifier" || !REGISTRABLE.has(callee.name)) return;
        const returns = findReturnsProperty(node);
        if (returns && containsVAny(returns.value)) {
          context.report({
            node: returns.value,
            message:
              "`returns:` must not be `v.any()` — it generates an `any` read type and defeats type safety. Use a concrete validator.",
          });
        }
      },
    };
  },
};
