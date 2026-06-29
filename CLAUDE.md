# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An oxlint **JS plugin** (not ESLint) that ships 9 syntactic rules enforcing Convex
backend best-practices. Rules use AST shape + source text only — no type information —
so a single-file lint runs in ~50–150ms, fast enough for an edit-time hook. Anything
genuinely type-aware is intentionally left to `@convex-dev/eslint-plugin` at commit/CI.

## Commands

```sh
npm test                              # run the full vitest suite
npx vitest run test/file-size.test.js # run one rule's tests
npx vitest                            # watch mode

# changelog (changie) — see CHANGELOG.md workflow below
npm run change                        # add an unreleased change fragment (interactive)
npm run changelog                     # batch auto-bump + merge into CHANGELOG.md
```

There is no build step — the package is plain ESM published as-is (`"type": "module"`,
`main: index.js`). Node >=18.

## Architecture

`index.js` is the plugin entry: it imports each rule from `rules/` and exposes them
under `meta.name: "convex"`, so an enabled rule is referenced as `convex/<rule-id>`
(e.g. `convex/file-size`) in an `.oxlintrc.json`.

Each file in `rules/` is one oxlint rule: `{ meta, create(context) }` returning AST
visitor methods. Rules report via `context.report({ node, message })` and read source
text via `context.sourceCode.getText(...)`.

Three shared libs in `lib/` are the backbone every rule builds on — understand these
before editing rules:

- **`lib/config.js`** — `resolveConfig(context, defaults)`. Threshold resolution with a
  fixed precedence: **inline oxlint rule option → nearest `.pre-commit.json`
  `convexCheckConfig` → built-in default**. It walks up from the linted file's directory
  to find `.pre-commit.json` (JSONC, comments stripped) and caches per-directory. This is
  why the IDE, edit-time hooks, and CI all agree on one source of truth — they read the
  same file. `excludePaths` and `crudDomains` always merge in from the file.
- **`lib/paths.js`** — path predicates: `isExcluded` (built-in skips `_generated/` +
  `*.test.*`/`*.spec.*`, plus configured `excludePaths`), `isUnderAny`, `crudFolderOf`.
  Paths are normalized to `/` separators before matching.
- **`lib/convex-ast.js`** — Convex-specific AST helpers shared across the return/registration
  rules: the `REGISTRABLE` / `PUBLIC_REGISTRABLE` sets (which callees count as Convex
  functions), `registrableCallee`, `isRegisteredExport` (matches `export const foo =
  query({...})`), and `findReturnsProperty`.

The standard rule shape: `resolveConfig` for thresholds → early-return if `isExcluded` →
return AST visitors that report findings. Follow an existing rule (e.g.
`rules/no-collect-in-query.js`) when adding one, and register it in `index.js`.

## Tests

`test/harness.js` exports `lint({ code, ruleId, options, filename })`. It writes the code
+ a generated `.oxlintrc.json` into a temp dir and shells out to the real `oxlint` binary,
then parses `--format=json` output and filters to `convex(<ruleId>)` diagnostics. So tests
exercise the rule **through actual oxlint**, not a mock — `filename` controls the on-disk
path so path-based rules (CRUD layout, type-export location) can be tested. Each rule has a
matching `test/<rule-id>.test.js` asserting `toHaveLength` on the returned diagnostics.

## Changelog

Releases are managed by [changie](https://changie.dev). Add a fragment with `npm run
change` for any user-facing change (committed under `.changes/unreleased/`). At release
time `npm run changelog` auto-bumps the version from the fragment kinds, syncs
`package.json` `version` (via the `replacements` block in `.changie.yaml`), and merges
`CHANGELOG.md`. Auto-bump map: Added/Deprecated → minor, Changed/Removed → major,
Fixed/Security → patch.
