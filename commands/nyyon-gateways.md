---
description: Build a new gateway (the boundary to one external service) the layered-service-framework way
argument-hint: <slug> e.g. serpapi, twilio, pdl
---

Build a **gateway** for `$ARGUMENTS`, following the layered-service-framework skill.

A gateway is the boundary to ONE external service (an API, a DB table, a daemon, a web
fetch). It is the only layer allowed to touch the outside world. It does **no reasoning**.

Steps:
1. Read the skill's `templates/gateway.js` as the skeleton. Read any existing gateway in
   `gateways/` first so the new one matches house style (never work from memory).
2. Confirm the service, its endpoints, and the `configFields` it needs (secrets + settings).
   Secrets are write-only, never returned to the client.
3. Implement `call(env, input)`: map input to a request, map the response to plain JSON.
   Retries, pagination, auth, and timeouts live here. Nothing else does.
4. Give it `{ slug, service, description, modes, input, output, configFields }`.
5. Register it: add the slug to the `GATEWAYS` object in `gateways/index.js`.
6. Run `node scripts/validate.mjs` and fix every violation before finishing.

Guardrails: no business logic, no LLM call (only the dedicated `llm` gateway may), no calling
another gateway. The moment it *decides* something, it is a tool, not a gateway.
