---
description: Review changed code against the nyyon-lite guardrail checklist and report violations
argument-hint: [paths]
---

Review the current work against the nyyon-lite skill's guardrails. Report only, apply
nothing. Scope: the git diff (`git diff` + `git diff --cached`, or working tree vs `main`);
if `$ARGUMENTS` names paths, review those instead.

If a `nyyon-reviewer` subagent exists, delegate the read-only analysis to it. Otherwise do
it yourself. Read the skill and each changed file before judging; never work from memory.

For every changed component, check its layer's rules:
1. Gateway: does it reason or run an LLM (only the llm gateway may)? Does it call another
   gateway? Is it registered in the `GATEWAYS` pool (`gateways/index.js`)?
2. Tool: is it in the shared `TOOLS` pool (`tools/index.js`)? Does it reach services ONLY
   via `GATEWAYS.<slug>.call`? Do its declared `gateways: [...]` match what it actually
   uses? Does it call another tool (forbidden, compose in a workflow)?
3. Workflow: are its `steps` all existing tool names? Any branching, math, or logic (none
   allowed)? Registered in `WORKFLOWS`?
4. Module: registered in the `MODULES` registry (`registry.js`)? Ships exactly one page wired
   into `PAGES` by `manifest.surface`? Uses only shared tools/gateways, no private ones, no
   raw `fetch`?
5. Mutation: does every meaningful state change call `logEvent(env, kind, actor, payload)`?

Also flag any raw `fetch()` or direct DB access outside a gateway, and any file written
below ~80% of its prior length (truncation).

Report violations ranked most-severe first. For each: `file:line`, which rule it breaks, and
the fix. If clean, say so. Do not edit anything; hand fixes to `/nyyon` or a manual edit.
