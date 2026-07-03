---
description: Run a read-only health check on a nyyon-lite install and report a pass/fail checklist
argument-hint: (none)
---

Run a **read-only** health check of this nyyon-lite install. Never edit, create, or delete
anything. Read files, run the validator, and report. If a fix is needed, describe it, do not
apply it.

Steps:
1. Confirm the skill and commands are wired: the nyyon-lite skill exists and every
   `/nyyon-*` command file is present in `commands/`. Note any missing command.
2. Confirm each registry file loads and lists real components: `gateways/index.js` (GATEWAYS),
   `tools/index.js` (TOOLS), `workflows/index.js` (WORKFLOWS), `registry.js` (MODULES) plus the
   `PAGES` map. For each, confirm every component file on disk is registered, and every
   registered name points at a file that exists.
3. Run `node scripts/validate.mjs` and report its exact result (pass, or each violation).
4. Scan for drift the validator may miss: components present but unregistered; a module with
   no page in `PAGES`; a state mutation with no `logEvent`; a hard-coded threshold, list, or
   prompt in a tool/module that belongs in a knowledge note; a workflow step naming a tool
   that does not exist; a raw `fetch()`/DB call outside a gateway.
5. Output a short checklist. One line per check: PASS or FAIL. For each FAIL give the
   `file:line` and the one-sentence fix (which command to run, which registry line to add,
   where the value should move). End with an overall verdict.

Guardrail: this command is strictly read-only. It reports problems and the fix for each, but
changes nothing. Do not run the build commands, do not stage edits, do not deploy.
