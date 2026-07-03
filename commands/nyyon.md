---
description: Plan and build a whole capability across all five layers the nyyon-lite way
argument-hint: <what you want built>
---

Build whatever `$ARGUMENTS` describes, following the nyyon-lite skill. This is the flagship
command: it plans across all five layers, confirms, then drives the per-layer commands in order.

1. Load the skill and READ the existing registries first, never from memory:
   `gateways/index.js`, `tools/index.js`, `workflows/index.js`, `registry.js`. Note every
   gateway, tool, workflow, module, and page that already exists so you REUSE what is there.

2. Analyze `$ARGUMENTS` against all five layers and decide what each needs:
   - GATEWAY for every NEW external service (API, DB, daemon, web fetch) not already present.
   - TOOL for every distinct job. One job per tool. Reuse an existing tool where it fits.
   - WORKFLOW for every multi-step sequence of existing tools (ordered, no logic).
   - MODULE + SURFACE for each product area and screen the result needs.
   - KNOWLEDGE note for every constant, list, threshold, or rule you would otherwise hardcode.

3. Produce an ORDERED plan in strict dependency order: gateways, then tools, then workflows,
   then modules and surfaces. Slot knowledge notes wherever a rule or constant would be
   hardcoded. Map each step to its command: `/nyyon-gateways`, `/nyyon-tools`,
   `/nyyon-workflows`, `/nyyon-modules`, `/nyyon-surfaces`, `/nyyon-knowledge`. Mark steps
   that reuse an existing component as "reuse", not "build".

4. Show the plan (each step: layer, name, command, build-or-reuse) and get a quick yes before
   building anything.

5. Execute the steps in order. For each: follow that layer's command recipe, write COMPLETE
   files, register in the right index, then run `node scripts/validate.mjs` and fix every
   violation before moving on. Take a git checkpoint before each apply so a bad step is one
   `git restore .` away. Call `logEvent` on every mutation.

6. Never break these: no logic in the wrong layer, no `fetch`/DB outside a gateway, no tool
   calling another tool, always write the complete file (a shrink below ~80% = truncation, reject).

7. Finish by running `/nyyon-map`, optionally `/nyyon-test` each new tool or gateway against the
   outcomes you intended, and giving a short summary of what was built and reused.
