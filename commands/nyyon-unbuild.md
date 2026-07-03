---
description: Cleanly remove a gateway, tool, workflow, or module and every registration of it
argument-hint: <layer> <name>
---

Remove the component named in `$ARGUMENTS` (its layer and name), following the nyyon-lite skill.
This is the inverse of a build command: a component is a known, finite set of registrations, so
removal must undo every one, or it leaves a headless ghost that breaks the guardrails.

Steps:
1. Locate it: find the file under gateways/ tools/ workflows/ modules/ and read it. Find every
   place it is referenced: its pool or registry (GATEWAYS, TOOLS, WORKFLOWS, MODULES in
   gateways/index.js, tools/index.js, workflows/index.js, registry.js), a module's PAGES entry
   for a surface, and any workflow whose steps name a tool you are removing.
2. Check dependents first: if another component still uses this one (a workflow step, a module
   route, a tool's gateway), STOP and list them. Removing it would break them. Fix or remove
   those first, or confirm the intent.
3. Rewrite each registry as a COMPLETE file with that entry removed (honor the whole-file rule,
   never a partial edit). Remove the page from the PAGES map for a module or surface.
4. Delete the component file.
5. Migrations: if a module owned tables, FLAG the migration that would need a down. Never
   auto-drop a table or run a destructive migration.
6. Run `node scripts/validate.mjs` to prove nothing dangles: no unregistered references, no
   orphan imports.
7. Call logEvent for the removal and give a short summary of what was removed and what had
   referenced it.

Guardrail: never leave a half-removed component (a file gone but still registered, or a registry
entry with no file). Remove all of it or none of it.
