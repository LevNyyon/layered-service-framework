---
description: Add a knowledge note (editable rules/constants, not code) the layered-service-framework way
argument-hint: <slug>
---

Add a **knowledge note** `$ARGUMENTS`, following the layered-service-framework skill.

Knowledge holds constants and business rules a human can edit in plain words, so behavior
changes without touching code or deploying.

Steps:
1. Find the hard-coded thing this replaces: a threshold, a list, a prompt, a business rule
   baked into a tool or module. That literal is what becomes the note.
2. Seed a sensible default in code that self-inserts on first read, so the note always exists
   and is editable.
3. Read the note at runtime; point the tool/module at it instead of the literal.
4. Run `node scripts/validate.mjs`.

Guardrail: constants and editable rules live in knowledge, not in tool/module code. Editing
the note must change behavior with no code change.
