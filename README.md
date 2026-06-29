# @milehighideas/oxlint-plugin-convex

Oxlint plugin that keeps Convex backend files small and single-purpose and
enforces Convex return/validator best-practices. Rules are syntactic (no type
info) so they run at native oxlint speed — fast enough for edit-time hooks.

## Install

```sh
npm i -D @milehighideas/oxlint-plugin-convex
```

## Configure (`.oxlintrc.json`)

```jsonc
{
  "jsPlugins": ["@milehighideas/oxlint-plugin-convex"],
  "rules": {
    "convex/file-size": "warn",
    "convex/max-functions": "warn",
    "convex/require-returns": "warn",
    "convex/no-any-returns": "warn",
    "convex/no-api-imports": "warn",
    "convex/type-exports-location": "warn",
    "convex/no-filter-in-query": "warn",
    "convex/no-collect-in-query": "warn"
  }
}
```

## Configure (`.convex-lint.json`)

Config lives in a dedicated `.convex-lint.json` at the project root — the single
source of truth shared by the IDE, an edit-time hook, a commit gate, and CI
(it governs edit-time too, so it doesn't belong in a commit-only config):

```jsonc
{
  "appPaths": ["packages/backend/convex"],
  "excludePaths": ["_generated/", "schema/", "registry/", "migrations/"],
  "maxLines": 400,
  "maxFunctions": 8,
  "crudDomains": [],
  // rule ids that BLOCK (error); everything else is warning-only
  "errorRules": ["type-exports-location"]
}
```

Resolution order per option: inline oxlint rule option → `.convex-lint.json`
(or a `convexCheckConfig` block in `.pre-commit.json`, for back-compat) →
built-in default (`maxLines: 400`, `maxFunctions: 8`). `errorRules` is consumed
by the commit/edit-time gate, not the plugin itself.

## Rules

| Rule | Flags |
| --- | --- |
| `file-size` | files over `maxLines` |
| `max-functions` | more than `maxFunctions` registered Convex functions (`query`/`mutation`/`action`/`internal*`/`httpAction`) |
| `require-returns` | public `query`/`mutation`/`action` missing a `returns:` validator |
| `no-any-returns` | `returns:` containing `v.any()` (incl. nested in `v.union`) |
| `no-api-imports` | importing `api` from `_generated/api` inside `convex/` (use `internal.*`) |
| `type-exports-location` | `type`/`interface` exports outside a `types/` folder or `*.types.ts` |
| `no-filter-in-query` | `.filter(q => … q.field(…))` on a db query (use `.withIndex()`) |
| `no-collect-in-query` | `.collect()` on a db query (prefer `.take()`/`.paginate()`) |
| `crud-structure` | opt-in via `crudDomains`: >1 fn/file, or a fn outside `create/read/update/delete` |

Skipped everywhere: `_generated/`, `*.test.*`/`*.spec.*`, plus any
`excludePaths`. `type-exports-location` also skips `schema/` and `types/`.

## Why syntactic?

Type-aware lint rules build the whole TypeScript program per run (seconds), too
slow for an edit-time hook. These rules use AST shape + source text only, so a
single-file lint is ~50–150 ms with no daemon. The one genuinely type-aware
Convex rule, `explicit-table-ids`, is left to `@convex-dev/eslint-plugin` at
commit/CI.

## License

MIT
