import { resolveConfig } from "../lib/config.js";
import { isExcluded, isUnderAny, crudFolderOf } from "../lib/paths.js";
import { isRegisteredExport } from "../lib/convex-ast.js";

export default {
  meta: {
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: { crudDomains: { type: "array", items: { type: "string" } } },
        additionalProperties: true,
      },
    ],
  },
  create(context) {
    const config = resolveConfig(context, { crudDomains: [], excludePaths: [] });
    const filename = context.filename ?? "";
    if (isExcluded(filename, config)) return {};
    if (!isUnderAny(filename, config.crudDomains)) return {}; // dormant unless opted in

    const registered = [];
    return {
      ExportNamedDeclaration(node) {
        if (isRegisteredExport(node)) registered.push(node);
      },
      "Program:exit"(node) {
        if (registered.length === 0) return;
        if (!crudFolderOf(filename)) {
          context.report({
            node: registered[0],
            message:
              "Registered Convex functions in this domain must live in a create/read/update/delete folder.",
          });
          return;
        }
        if (registered.length > 1) {
          context.report({
            node: registered[1],
            message: `CRUD files must export exactly one registered function (found ${registered.length}). One operation per file.`,
          });
        }
      },
    };
  },
};
