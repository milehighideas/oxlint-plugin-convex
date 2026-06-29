import fs from "node:fs";
import path from "node:path";
import stripJsonComments from "strip-json-comments";

const fileCache = new Map(); // dir → resolved convex config | null

function parseJsonc(file) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(file, "utf8")));
  } catch {
    return null;
  }
}

// Walk up from startDir looking for the convex lint config. Prefer the
// dedicated .convex-lint.json (the whole file IS the config); fall back to a
// convexCheckConfig block in .pre-commit.json for back-compat.
function findConvexConfig(startDir) {
  let dir = startDir;
  for (;;) {
    if (fileCache.has(dir)) return fileCache.get(dir);

    const dedicated = path.join(dir, ".convex-lint.json");
    if (fs.existsSync(dedicated)) {
      const cfg = parseJsonc(dedicated) ?? {};
      fileCache.set(dir, cfg);
      return cfg;
    }

    const preCommit = path.join(dir, ".pre-commit.json");
    if (fs.existsSync(preCommit)) {
      const cfg = parseJsonc(preCommit)?.convexCheckConfig ?? {};
      fileCache.set(dir, cfg);
      return cfg;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      fileCache.set(startDir, {});
      return {};
    }
    dir = parent;
  }
}

// Resolution order per key: rule inline option → .convex-lint.json (or
// .pre-commit.json convexCheckConfig fallback) → default.
export function resolveConfig(context, defaults) {
  const filename = context.filename ?? context.getFilename?.() ?? "";
  const fromFile = findConvexConfig(path.dirname(filename || process.cwd()));
  const opt = (context.options && context.options[0]) || {};
  const out = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (opt[key] !== undefined) out[key] = opt[key];
    else if (fromFile[key] !== undefined) out[key] = fromFile[key];
  }
  // excludePaths/crudDomains always merge from file even if not in defaults
  out.excludePaths = opt.excludePaths ?? fromFile.excludePaths ?? defaults.excludePaths ?? [];
  out.crudDomains = opt.crudDomains ?? fromFile.crudDomains ?? defaults.crudDomains ?? [];
  return out;
}
