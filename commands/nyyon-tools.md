---
description: Build a new tool (one job, in the shared pool) the layered-service-framework way
argument-hint: <name> e.g. score_icp_fit
---

Build a **tool** named `$ARGUMENTS`, following the layered-service-framework skill.

A tool does ONE job. It reaches external services ONLY through gateways, lives in the single
shared pool every module can use, and never calls another tool.

Steps:
1. Read the skill's `templates/tool.js` as the skeleton. Read a neighboring tool first for
   house style.
2. Declare every gateway it touches in `gateways: [...]`; reach them via
   `GATEWAYS.<slug>.call(env, ...)`. Never `fetch()` or hit a DB directly.
3. Implement `run(env, input)` returning JSON. ONE job. If it needs a second job, that is a
   second tool plus a workflow, not more code here.
4. Give it `{ name, description, input, output, gateways }`.
5. `logEvent(env, kind, actor, payload)` on any state mutation.
6. Register it: add the name to the `TOOLS` object in `tools/index.js`.
7. Ship one runnable check that fails if the logic breaks.
8. Run `node scripts/validate.mjs` and fix every violation.

Guardrails: no raw fetch/DB (use a gateway), no tool-to-tool calls (compose in a workflow),
JSON in / JSON out, log meaningful mutations.
