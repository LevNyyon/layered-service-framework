---
description: Add a surface (a page/view) to an existing module the nyyon-lite way
argument-hint: <module-slug> <surface-name>
---

Add a **surface** (a page/view) to the existing module `$ARGUMENTS`, following the
nyyon-lite skill.

A surface is one screen of a module's visualization. Use this when a module already exists
and needs another view (a dashboard, a detail screen, a second tab), not a new product area.

Steps:
1. Read the skill's `templates/module.page.jsx` and the module's existing page(s) for house
   style. Never work from memory.
2. Write the new page under `web/src/pages`. Reuse the design system's classes; invent no new
   CSS. Fetch only this module's own `/api` routes.
3. Register it: add the page to the `PAGES` map under its surface key, and add the surface to
   the module's `manifest` (a module may declare more than one surface) so nav resolves it.
4. If the view needs data the module does not yet expose, add the route to the module's
   `registerRoutes` (calling shared tools / `GATEWAYS.*`), not a raw fetch in the page.
5. Run `node scripts/validate.mjs`.

Guardrail: a surface is a view, not a product area. If it needs its own storage or a
distinct domain of routes, build a `/nyyon-modules` instead. Every surface reuses the shared tools
and gateways; none fetches a service directly.
