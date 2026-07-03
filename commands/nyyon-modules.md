---
description: Build a new module (a product area + its screen) the layered-service-framework way
argument-hint: <slug>
---

Build a **module** named `$ARGUMENTS`, following the layered-service-framework skill.

A module is one product area. It owns its API routes and ships exactly one **visualization**
(a page). It uses the shared tools and gateways, never private ones, never a raw fetch.

Steps:
1. Read the skill's `templates/module.index.js` and `templates/module.page.jsx`. Read an
   existing module first for house style.
2. Write the module: `{ manifest: { slug, name, surface, description }, registerRoutes(app),
   listeners }`. Routes call shared tools (`runTool`) / `GATEWAYS.*` and `logEvent`.
3. Write its page under `web/src/pages`, wired to `manifest.surface` in the `PAGES` map.
   Reuse the design system's classes; invent no new CSS.
4. If it needs storage, add an ordered migration from `templates/migration.sql`.
5. Register it: add the module to the `MODULES` registry in `registry.js`.
6. Run `node scripts/validate.mjs`.

Guardrail: every module ships a visualization and is registered. No headless modules, no
private tools or gateways hidden inside it.
