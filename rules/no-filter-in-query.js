import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";

export default {
  meta: { type: "problem" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee?.type !== "MemberExpression" || callee.property?.name !== "filter") return;
        const cb = node.arguments?.[0];
        if (!cb || (cb.type !== "ArrowFunctionExpression" && cb.type !== "FunctionExpression")) return;
        const param = cb.params?.[0];
        if (param?.type !== "Identifier") return;
        // discriminator: the callback body calls `<param>.field(` — a JS array
        // .filter callback never does. No type info needed.
        const bodyText = context.sourceCode.getText(cb.body);
        const re = new RegExp(`\\b${param.name}\\s*\\.\\s*field\\s*\\(`);
        if (re.test(bodyText)) {
          context.report({
            node,
            message:
              "`.filter()` on a Convex db query scans the whole table — use `.withIndex()` instead.",
          });
        }
      },
    };
  },
};
