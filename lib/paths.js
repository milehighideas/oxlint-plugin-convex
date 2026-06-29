import path from "node:path";

const BUILTIN_SKIPS = ["/_generated/", "_generated/"];
const TEST_SUFFIXES = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx"];

export function isExcluded(filename, config) {
  const f = filename.replaceAll(path.sep, "/");
  if (BUILTIN_SKIPS.some((s) => f.includes(s))) return true;
  if (TEST_SUFFIXES.some((s) => f.endsWith(s))) return true;
  for (const ex of config.excludePaths ?? []) {
    if (ex && f.includes(ex.replaceAll(path.sep, "/"))) return true;
  }
  return false;
}

export function isUnderAny(filename, substrings) {
  const f = filename.replaceAll(path.sep, "/");
  return (substrings ?? []).some((s) => s && f.includes(s.replaceAll(path.sep, "/")));
}

export function crudFolderOf(filename) {
  const f = filename.replaceAll(path.sep, "/");
  for (const folder of ["create", "read", "update", "delete"]) {
    if (f.includes(`/${folder}/`)) return folder;
  }
  return null;
}
