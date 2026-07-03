# layered-service-framework

An installable agent **skill**: a methodology + copy-paste templates for building and
extending a system in five layers.

```
gateway  ->  tool  ->  workflow  ->  module  ->  knowledge
(one         (one      (ordered     (a product    (editable
 service)     job)      tools)       area + UI)     rules)
```

Each layer reaches only the layer(s) below it. Everything is JSON in / JSON out. Every
meaningful mutation logs to an activity bus. Behavior lives in editable knowledge, not code.

## What's here

- **`SKILL.md`** — the skill. When to use it, the model, a "which layer do I need" decision
  table, a build recipe per layer, the guardrails, anti-patterns, and a review checklist.
- **`templates/`** — a copy-paste skeleton per component: `gateway.js`, `tool.js`,
  `workflow.js`, `module.index.js`, `module.page.jsx`, `migration.sql`.

## Install (on any Claude Code / agent)

Clone it into the agent's skills folder:

```bash
git clone https://github.com/LevNyyon/layered-service-framework.git \
  ~/.claude/skills/layered-service-framework
```

Or per-project: `.claude/skills/layered-service-framework`. The skill auto-triggers on
build / extend / wire-a-service / review tasks via its description.

## Use it

Ask the agent to add a capability. It will: pick the right layer, copy the matching
template, follow the recipe, register the component, check it against the guardrails, and
log the action. Ask it to review, and it walks the checklist and reports violations with
file:line + fix.
