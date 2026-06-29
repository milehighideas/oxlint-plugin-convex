import fileSize from "./rules/file-size.js";
import maxFunctions from "./rules/max-functions.js";
import requireReturns from "./rules/require-returns.js";
import noAnyReturns from "./rules/no-any-returns.js";
import noApiImports from "./rules/no-api-imports.js";
import typeExportsLocation from "./rules/type-exports-location.js";
import noFilterInQuery from "./rules/no-filter-in-query.js";
import noCollectInQuery from "./rules/no-collect-in-query.js";
import crudStructure from "./rules/crud-structure.js";

export default {
  meta: { name: "convex" },
  rules: {
    "file-size": fileSize,
    "max-functions": maxFunctions,
    "require-returns": requireReturns,
    "no-any-returns": noAnyReturns,
    "no-api-imports": noApiImports,
    "type-exports-location": typeExportsLocation,
    "no-filter-in-query": noFilterInQuery,
    "no-collect-in-query": noCollectInQuery,
    "crud-structure": crudStructure,
  },
};
