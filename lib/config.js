import fs from "node:fs";
import path from "node:path";
import stripJsonComments from "strip-json-comments";

const fileCache = new Map(); // dir → parsed convexCheckConfig | null

function findPreCommitConfig(startDir) {
  let dir = startDir;
  // walk up to filesystem root
  for (;;) {
    if (fileCache.has(dir)) return fileCache.get(dir);
    const candidate = path.join(dir, ".pre-commit.json");
    if (fs.existsSync(candidate)) {
      let parsed = null;
      try {
        parsed = JSON.parse(stripJsonComments(fs.readFileSync(candidate, "utf8")));
      } catch {
        parsed = null;
      }
      const cfg = parsed?.convexCheckConfig ?? {};
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

// Resolution order per key: rule inline option → .pre-commit.json convexCheckConfig → default.
export function resolveConfig(context, defaults) {
  const filename = context.filename ?? context.getFilename?.() ?? "";
  const fromFile = findPreCommitConfig(path.dirname(filename || process.cwd()));
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
