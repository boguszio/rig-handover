---
id: 3
title: "Digest page: GET /digest/:night"
state: closed
labels: ["plan:morning-digest"]
created: 2026-10-29T15:07:09Z
closed: 2026-10-29T15:17:36Z
---

Source: plan.md § 2a

## Scope
`GET /digest/:night` renders the rows with the usual layout: one table, sorted by job, retries of 3 or more and any `fail` marked. A night with no file returns 404; an empty file renders "nothing ran". Missing data renders as `—`.

## Done when
`/digest/2026-10-28` renders locally.

## Blocked by
#1 (rendering the real night also needs #2)

## Closing comment

done: GET /digest/:night renders the night's table (warn on retries >= 3 or fail, 404, nothing ran)
worker: claude-code · sonnet-5.5 · default
commit: 60693fb
