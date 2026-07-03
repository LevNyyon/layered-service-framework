#!/usr/bin/env node
// nyyon-lite layer enforcer. Zero-dep Node ESM. Scans file args (default: repo).
// This is what /nyyon-gateways, /nyyon-tools, /nyyon-workflows, /nyyon-modules,
// /nyyon-surfaces, /nyyon-knowledge all call before they claim "done".
//
// Rules checked (exit 2 with file + rule + fix on stderr on any violation):
//   1. no-raw-service     : fetch( or a raw DB call inside tools/ or modules/  -> route through a gateway
//   2. no-tool-to-tool    : import from tools/ inside another tools/ file       -> tools never call tools
//   3. unregistered       : a component file under gateways|tools|workflows|modules
//                           not referenced by its index/registry              -> register it
//
// NOT checked here: the ~80%-shrink / truncation rule. That is an APPLY-TIME check
// (compare new file length to prior length); it cannot be seen from a static scan.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: node scripts/validate.mjs [files...]
Enforces the nyyon-lite five-layer rule (each layer reaches only below it).
No args = scan the whole repo. Exits 2 on any violation, 0 when clean.
Checks: no-raw-service, no-tool-to-tool, unregistered.`);
  process.exit(0);
}

// Layer dir -> the index/registry file whose text must mention each component.
const REGISTRIES = {
  gateways: ["gateways/index.js"],
  tools: ["tools/index.js"],
  workflows: ["workflows/index.js"],
  modules: ["registry.js", "modules/registry.js"],
};

// Gather target files.
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "scripts") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(js|jsx|ts|tsx|mjs)$/.test(name)) out.push(p);
  }
}
let files = args.length ? args.map((a) => join(ROOT, a)) : [];
if (!files.length) walk(ROOT, files);

const violations = [];
const add = (file, rule, fix) =>
  violations.push({ file: relative(ROOT, file), rule, fix });

// Read the registry texts once so "unregistered" is a plain substring check.
const registryText = {};
for (const [layer, cands] of Object.entries(REGISTRIES)) {
  for (const c of cands) {
    try { registryText[layer] = (registryText[layer] || "") + readFileSync(join(ROOT, c), "utf8"); } catch {}
  }
}

const RAW_DB = /\b(db|env\.DB|D1|prepare|\.query|createConnection|new Pool)\s*[.(]/;
const INDEX_FILES = /\/(index|registry)\.(js|ts|mjs)$/;

for (const file of files) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  const rel = relative(ROOT, file);
  const inTools = rel.startsWith("tools/");
  const inModules = rel.startsWith("modules/");
  const isIndex = INDEX_FILES.test("/" + rel);

  // Rule 1: no raw external service reach inside tools/ or modules/.
  if ((inTools || inModules) && !isIndex) {
    if (/\bfetch\s*\(/.test(src))
      add(file, "no-raw-service (fetch)", "call the target through GATEWAYS.<slug>.call(env, input), never fetch() directly");
    if (RAW_DB.test(src))
      add(file, "no-raw-service (db)", "wrap the DB in a gateway and call GATEWAYS.<slug>.call(env, input); tools/modules never touch a driver");
  }

  // Rule 2: no tool importing another tool.
  if (inTools && !isIndex) {
    const imports = src.match(/(?:import[^'"]*|require\()\s*['"]([^'"]+)['"]/g) || [];
    for (const line of imports) {
      const spec = line.match(/['"]([^'"]+)['"]/)[1];
      if (/(^|\/)tools\//.test(spec) && !/tools\/index/.test(spec))
        add(file, "no-tool-to-tool", `remove import of ${spec}; a tool does ONE job and never calls another tool. Compose via a workflow instead`);
    }
  }

  // Rule 3: a component file must be referenced by its layer index/registry.
  const layer = ["gateways", "tools", "workflows", "modules"].find((l) => rel.startsWith(l + "/"));
  if (layer && !isIndex) {
    const stem = basename(rel).replace(/\.(js|jsx|ts|tsx|mjs)$/, "");
    const text = registryText[layer] || "";
    if (!text.includes(stem))
      add(file, "unregistered", `add ${stem} to the ${REGISTRIES[layer][0]} pool/registry, or delete the orphan file`);
  }
}

if (violations.length) {
  console.error(`\nnyyon-lite validate: ${violations.length} violation(s)\n`);
  for (const v of violations)
    console.error(`  ${v.file}\n    rule: ${v.rule}\n    fix:  ${v.fix}\n`);
  // Exit 2 (not 1): on PostToolUse hooks only exit 2 feeds stderr back to the
  // model so it self-corrects; exit 1 would reach the user only.
  process.exit(2);
}
console.log(`nyyon-lite validate: OK (${files.length} files, no layer violations)`);
process.exit(0);
