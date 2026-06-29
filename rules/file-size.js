import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";

export default {
  meta: {
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: { maxLines: { type: "number" } },
        additionalProperties: true,
      },
    ],
  },
  create(context) {
    const config = resolveConfig(context, { maxLines: 400, excludePaths: [], crudDomains: [] });
    const filename = context.filename ?? "";
    if (isExcluded(filename, config)) return {};
    return {
      Program(node) {
        const text = context.sourceCode.getText();
        const lines = text.length === 0 ? 0 : text.split("\n").length;
        if (lines > config.maxLines) {
          context.report({
            node,
            message: `Convex file is ${lines} lines (limit: ${config.maxLines}). Split into smaller files — see convex/REFACTORING.md.`,
          });
        }
      },
    };
  },
};
