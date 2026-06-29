import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";
import { isRegisteredExport } from "../lib/convex-ast.js";

export default {
  meta: {
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: { maxFunctions: { type: "number" } },
        additionalProperties: true,
      },
    ],
  },
  create(context) {
    const config = resolveConfig(context, { maxFunctions: 8, excludePaths: [], crudDomains: [] });
    if (isExcluded(context.filename ?? "", config)) return {};
    let count = 0;
    let lastNode = null;
    return {
      ExportNamedDeclaration(node) {
        if (isRegisteredExport(node)) {
          count++;
          lastNode = node;
        }
      },
      "Program:exit"(node) {
        if (count > config.maxFunctions) {
          context.report({
            node: lastNode ?? node,
            message: `File has ${count} registered Convex functions (limit: ${config.maxFunctions}). Split by sub-domain (or one per file under create/read/update/delete).`,
          });
        }
      },
    };
  },
};
