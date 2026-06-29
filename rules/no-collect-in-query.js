import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";

export default {
  meta: { type: "suggestion" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee?.type !== "MemberExpression" || callee.property?.name !== "collect") return;
        const receiverText = context.sourceCode.getText(callee.object);
        if (/\.\s*query\s*\(/.test(receiverText)) {
          context.report({
            node,
            message:
              "`.collect()` on a db query loads the whole result set — prefer `.take(n)` or `.paginate()` for unbounded tables.",
          });
        }
      },
    };
  },
};
