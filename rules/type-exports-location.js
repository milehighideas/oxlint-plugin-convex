import { resolveConfig } from "../lib/config.js";
import { isExcluded } from "../lib/paths.js";

function isTypeHome(filename) {
  const f = filename.replaceAll("\\", "/");
  return f.includes("/types/") || f.endsWith(".types.ts") || f.includes("/schema/");
}

export default {
  meta: { type: "suggestion" },
  create(context) {
    const config = resolveConfig(context, { excludePaths: [], crudDomains: [] });
    const filename = context.filename ?? "";
    if (isExcluded(filename, config) || isTypeHome(filename)) return {};

    function report(node, name) {
      context.report({
        node,
        message: `Type export '${name}' should live in a types/ folder or a *.types.ts file.`,
      });
    }

    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (decl?.type === "TSTypeAliasDeclaration") report(node, decl.id?.name ?? "type");
        else if (decl?.type === "TSInterfaceDeclaration") report(node, decl.id?.name ?? "interface");
        else if (node.exportKind === "type") {
          for (const s of node.specifiers ?? []) report(node, s.exported?.name ?? "type");
        }
      },
    };
  },
};
