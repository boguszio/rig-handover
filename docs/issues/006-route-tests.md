---
id: 6
title: "Route tests for the digest page and JSON"
state: closed
labels: ["plan:morning-digest"]
created: 2026-10-29T15:13:14Z
closed: 2026-10-29T15:17:38Z
---

Source: plan.md § 2d

## Scope
Route tests for `/digest/:night` and `/api/digest/:night` through `app.request()`: 200, 404 for a night with no file, the empty night, a night with a bad line. Use a temp runs dir; `runs/` is read-only.

## Done when
`pnpm test` is green with the new tests.

## Blocked by
#1

## Closing comment

done: route tests for page and JSON on a temp runs dir; pnpm test green (24 tests)
worker: claude-code · haiku-5.5 · default
commit: f3c9e2a
