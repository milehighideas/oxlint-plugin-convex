export const REGISTRABLE = new Set([
  "query",
  "mutation",
  "action",
  "internalQuery",
  "internalMutation",
  "internalAction",
  "httpAction",
]);

export const PUBLIC_REGISTRABLE = new Set(["query", "mutation", "action"]);

// Given a VariableDeclarator init (or any node), return the convex registrable
// callee name if it's a `query({...})`-style call, else null.
export function registrableCallee(init) {
  if (!init || init.type !== "CallExpression") return null;
  const callee = init.callee;
  if (callee?.type === "Identifier" && REGISTRABLE.has(callee.name)) return callee.name;
  return null;
}

// For an ExportNamedDeclaration node, return the registrable callee name of its
// first declarator init, else null. Handles `export const foo = query({...})`.
export function isRegisteredExport(node) {
  if (node.type !== "ExportNamedDeclaration") return null;
  const decl = node.declaration;
  if (!decl || decl.type !== "VariableDeclaration") return null;
  const d = decl.declarations?.[0];
  return registrableCallee(d?.init);
}

// Given a registrable CallExpression (query({...})), return the `returns`
// Property node from its config object literal, or null.
export function findReturnsProperty(callNode) {
  const arg = callNode.arguments?.[0];
  if (!arg || arg.type !== "ObjectExpression") return null;
  return (
    arg.properties.find(
      (p) =>
        p.type === "Property" &&
        p.key &&
        (p.key.name === "returns" || p.key.value === "returns"),
    ) || null
  );
}
