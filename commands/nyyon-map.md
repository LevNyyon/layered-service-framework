---
description: Introspect the current system and render its real wiring, read-only, no mutations
argument-hint: none (usage: /nyyon-map)
---

Render a map of the CURRENT nyyon-lite system, following the nyyon-lite skill. This command is
READ-ONLY: read files, render output, change nothing. `$ARGUMENTS` is unused.

Read the registries and knowledge notes first, never work from memory:
1. `gateways/index.js` (the `GATEWAYS` pool), `tools/index.js` (the `TOOLS` pool),
   `workflows/index.js` (the `WORKFLOWS` registry), `registry.js` (the `MODULES` registry),
   and every knowledge note.

For each component, read the file and list its declared dependencies:
2. A gateway: the one external service it wraps.
3. A tool: the gateways it calls via `GATEWAYS.slug.call(env, input)`.
4. A workflow: its ordered `steps` (the tool names, in order).
5. A module: its surface(s) and the tools/gateways its routes reach.

Render the wiring:
6. Print an indented text tree grouped by layer (GATEWAYS, TOOLS, WORKFLOWS, MODULES,
   KNOWLEDGE), each component with its dependencies nested under it.
7. Optionally also emit a mermaid graph of the same edges.

Flag anything off (do not fix it, just report):
8. A component file not present in its registry, a tool that imports another tool, a `fetch`
   or raw service call outside a gateway, and a mutation with no `logEvent` call.

End with counts per layer (how many gateways, tools, workflows, modules, knowledge notes).

Guardrail: this command never writes, registers, or deletes. If a fix is needed, name it and
point at the right `/nyyon-*` build command; leave the change to the human.
