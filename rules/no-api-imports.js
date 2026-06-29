import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";

export default {
  meta: { type: "problem" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    return {
      ImportDeclaration(node) {
        const src = node.source?.value ?? "";
        if (!src.includes("_generated/api")) return;
        for (const spec of node.specifiers) {
          if (spec.type === "ImportSpecifier" && spec.imported?.name === "api") {
            context.report({
              node: spec,
              message:
                "Do not import `api` inside the Convex functions directory — use `internal.*` for in-backend calls.",
            });
          }
        }
      },
    };
  },
};
