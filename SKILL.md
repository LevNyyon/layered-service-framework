---
name: layered-service-framework
description: >
  Methodology + templates for building and extending a system in five layers: gateway
  (boundary to one external service, no reasoning) -> tool (one job, reaches services only
  via gateways, lives in a shared pool) -> workflow (ordered existing tools, no logic) ->
  module (a product area with a UI page) -> knowledge (editable rules/constants). Use this
  when adding a capability, wiring a new external service, composing a multi-step flow,
  shipping a new product surface, storing an editable rule, or reviewing code for
  architecture violations. It tells you which layer a change belongs in, gives a copy-paste
  template per layer (see templates/), and enforces the guardrails that keep the system
  extensible: gateways never reason, tools share one pool, modules ship a visualization,
  rules live in knowledge, everything logs to an activity bus, files are written whole.
---

# Layered service framework

A discipline for systems that must stay extensible, especially ones an agent extends. JSON
in, JSON out at every boundary. Every layer reaches only the layer(s) below it. Every
meaningful mutation logs to an activity bus. Behavior is explainable because the rules live
in editable knowledge, not buried in code.

## The five layers

The one rule: **each layer may reach only the layer(s) below it. Never sideways, never up.**

1. **Gateway** — the boundary to ONE external service (an API, a DB table, a daemon, a web
   fetch). Translates in and out. **Does no reasoning.** Only the dedicated `llm` gateway
   may call an LLM.
2. **Tool** — does ONE job. Reaches external services ONLY through gateways. Lives in a
   single shared pool every module and workflow can use. May reason (via `llm`). Never
   calls another tool.
3. **Workflow** — an ordered list of EXISTING tools. No business rules, no branching. A
   generic runner threads a shared context through the steps.
4. **Module** — a product area. Owns its routes and a **visualization** (a page). Uses the
   shared tools and gateways; never defines private ones, never fetches a service directly.
5. **Knowledge** — editable notes holding constants and business rules. Code seeds a
   default; humans edit it. Changing behavior = editing a note, not code.

Under everything: an **Activity** event bus. `logEvent(env, kind, actor, payload)` on every
meaningful mutation. Not just a log, modules can subscribe.

## Building a component

First decide the layer:

| You need to... | Build a... |
|---|---|
| Talk to a NEW external service | **gateway** |
| Add a capability / action | **tool** (in the shared pool) |
| Run existing tools in order | **workflow** |
| Add a product area with its own screen | **module** (+ a page, + migrations) |
| Store an editable rule, list, or constant | **knowledge note** |

Then copy the matching file from `templates/` and follow its recipe.

### Build a GATEWAY  (`templates/gateway.js`)
1. Copy the template. Set `slug`, `service`, `modes`, `configFields`.
2. Implement `call(env, input)`: fetch the service, translate, return JSON. **No reasoning,
   no LLM, no calling another gateway** (except `llm` -> its fallback).
3. Register: add it to the `GATEWAYS` pool (`gateways/index.js`).
4. Give it a test probe so it can be validated with real input.

### Build a TOOL  (`templates/tool.js`)
1. Copy the template. One job. Set `input`, `output`, and `gateways` (list every gateway it
   calls).
2. In `run(env, input)`, reach services ONLY through `GATEWAYS.*`. Never `fetch()` directly.
   Never call another tool, compose those via a workflow.
3. `logEvent` on any state mutation.
4. Register: add it to the `TOOLS` pool (`tools/index.js`).

### Build a WORKFLOW  (`templates/workflow.js`)
1. Add `{ name, goal, steps: [toolNames] }` to the `WORKFLOWS` registry.
2. Every step must be a tool that already exists in the shared pool. No logic, no branching
   here, put rules in a knowledge note the tool reads.

### Build a MODULE  (`templates/module.index.js` + `templates/module.page.jsx`)
1. Copy both. The manifest declares a `surface`; the page is the visualization (required).
2. Routes call `runTool(...)` / `GATEWAYS.*` and `logEvent`. No private tools/gateways, no
   raw `fetch`.
3. New tables go in an ordered migration (`templates/migration.sql`).
4. Register: add the module to the `MODULES` registry, and the page to the `PAGES` map under
   `manifest.surface`.

### Add a KNOWLEDGE note
1. Seed a default in code that self-inserts on first read (so the note always exists and is
   editable).
2. Read the note at runtime. Editing the note changes behavior, no code change, no deploy.

## Guardrails (never break these)

1. **Gateways do not think.** No LLM, no business logic, no cross-gateway calls (except
   `llm` -> fallback). If it decides something, it is not a gateway.
2. **Tools share one pool.** Never hide a tool inside a module. Never call a tool from a tool.
3. **Workflows hold no rules.** Only order tools. Rules live in knowledge.
4. **Every module ships a visualization** and is registered. No headless modules.
5. **Constants and rules live in knowledge**, editable, seeded with a default.
6. **Everything logs.** Every meaningful mutation calls `logEvent`.
7. **JSON in, JSON out**, at every boundary.
8. **Writing a shared file = writing the COMPLETE file.** Never a partial replace, it
   silently deletes the rest. Reject any file shrunk below ~80% of the original.

## Anti-patterns (smell test)

- A gateway that calls an LLM or picks between options -> move the reasoning into a tool.
- A `fetch()` inside a tool or module -> route it through a gateway.
- A tool importing another tool -> extract the shared logic to a plain helper, or make a workflow.
- Business logic inside a workflow -> move it to a knowledge note the tool reads.
- A hardcoded threshold / list / prompt -> make it a seeded knowledge note.
- A mutation with no `logEvent` -> add one.
- A "quick edit" that replaces a big shared file with a short version -> you just deleted it.

## The build loop (for self-editing systems)

read the framework + every file you'll touch (never from memory) -> write COMPLETE files ->
register -> validate against the guardrails (a shrink below ~80% = truncated, reject) ->
commit a checkpoint (so a bad apply is one `git restore .` away) -> apply -> log.

## Review checklist

Walk every **gateway** (any reasoning? cross-gateway call?), every **tool** (in the shared
pool? reaches services only via gateways? declared `gateways` match usage? calls no other
tool?), every **workflow** (only existing tools? no logic?), every **module** (registered?
ships a page? no private tools/gateways? no raw fetch?), and every **mutation** (logged?).
Report file:line + which rule + the fix.
