---
description: Check that one tool or gateway behaves the way you describe, and suggest fixes where it does not
argument-hint: <tool-or-gateway> [the outcomes you expect, in plain words]
---

Behaviour-check a single tool or gateway named in `$ARGUMENTS`, following the nyyon-lite skill.

Every tool and gateway is JSON in and JSON out and reaches services only through gateways, so
each one can be exercised on its own. This command runs one in isolation, compares what it does
against what you say you expect, and points at the fix.

Steps:
1. Resolve the target: find it in the TOOLS pool (tools/index.js) or the GATEWAYS pool
   (gateways/index.js) and read its file to learn its input, output, and (for a tool) its
   declared gateways. If the name is missing or ambiguous, list the closest matches and stop.
2. Get the expected outcomes: use the plain-English expectations in `$ARGUMENTS`. If none were
   given, propose two or three likely expectations from the contract and confirm them first.
3. Turn each expectation into a concrete case: a representative input and the output shape or
   values it should produce. Include at least one edge case (a missing field, an upstream
   error) alongside the happy path.
4. Run it in isolation: call the tool's run(env, input) or the gateway's call(env, input) for
   each case, in a dev environment. Never fire a costly or destructive external call just to
   test: use the gateway's mock mode or a read-only input, and say so.
5. Compare: for each case, mark it aligned or misaligned, showing the input, the expected
   result, and the actual result.
6. Report: a short list of what aligned and what did not, with the exact diff per misalignment.
7. Suggest fixes: for each misalignment, propose the smallest fix in the correct layer (a
   gateway mapping, a tool's logic, a missing knowledge rule, a wrong contract) with file:line.
   Suggest only; apply through /nyyon or a manual edit, never from here.

Guardrail: test through the real contract, never a private path, and never mutate production or
spend on an external service just to check behaviour.
