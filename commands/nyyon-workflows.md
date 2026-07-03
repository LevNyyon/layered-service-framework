---
description: Build a new workflow (ordered existing tools, no logic) the nyyon-lite way
argument-hint: <name>
---

Build a **workflow** named `$ARGUMENTS`, following the nyyon-lite skill.

A workflow is an ordered list of EXISTING tools. A generic runner threads a shared context
through the steps. It holds **no** logic: no branching, no math, no side effects of its own.

Steps:
1. Read the skill's `templates/workflow.js`.
2. List the tools it chains, in order, by name. Every one must already exist in the `TOOLS`
   pool. If a step needs a tool that does not exist yet, build it first with `/nyyon-tools`.
3. Give it `{ name, goal, steps: [toolNames] }`.
4. Register it: add the entry to the `WORKFLOWS` registry in `workflows/index.js`.
5. Run `node scripts/validate.mjs`.

Guardrail: if you find yourself wanting an `if`, a loop, or a calculation, it does not belong
here. Put it in a tool (or a knowledge note the tool reads) and reference that tool.
