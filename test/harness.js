import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const oxlintBin = path.join(root, "node_modules", ".bin", "oxlint");
const pluginPath = path.join(root, "index.js");

// Lint `code` with a single convex rule enabled at error. `filename` controls
// the on-disk path (relative to the temp dir) so path-based rules can be tested.
export function lint({ code, ruleId, options, filename = "sample.ts" }) {
  const dir = mkdtempSync(path.join(tmpdir(), "oxconvex-"));
  try {
    const cfg = {
      jsPlugins: [pluginPath],
      rules: { [`convex/${ruleId}`]: options ? ["error", options] : "error" },
    };
    writeFileSync(path.join(dir, ".oxlintrc.json"), JSON.stringify(cfg));
    const target = path.join(dir, filename);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, code);
    let out = "";
    try {
      out = execFileSync(
        oxlintBin,
        ["--format=json", "--config", path.join(dir, ".oxlintrc.json"), target],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"], // ignore the experimental-plugins stderr warning
        },
      );
    } catch (e) {
      out = e.stdout || ""; // oxlint exits non-zero when error-severity findings exist
    }
    const json = JSON.parse(out);
    return (json.diagnostics || []).filter((d) => d.code === `convex(${ruleId})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
