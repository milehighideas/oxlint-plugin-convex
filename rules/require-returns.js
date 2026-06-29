import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";
import { PUBLIC_REGISTRABLE, findReturnsProperty } from "../lib/convex-ast.js";

export default {
  meta: { type: "problem" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee?.type !== "Identifier" || !PUBLIC_REGISTRABLE.has(callee.name)) return;
        if (!findReturnsProperty(node)) {
          context.report({
            node: callee,
            message: `Public ${callee.name} is missing a \`returns:\` validator. Without it the data-layer generates an \`any\` read type.`,
          });
        }
      },
    };
  },
};
