---
id: 4
title: "Digest JSON: GET /api/digest/:night"
state: closed
labels: ["plan:morning-digest"]
created: 2026-10-29T15:09:10Z
closed: 2026-10-29T15:17:36Z
---

Source: plan.md § 2b

## Scope
`GET /api/digest/:night` returns the same rows as JSON, from the same source as the page, so the page and the JSON never disagree (ADR 0001). Same 404 for a night with no file.

## Done when
The JSON for 2026-10-28 has the same jobs, in the same order, as the page.

## Blocked by
#1

## Closing comment

done: GET /api/digest/:night returns DigestNight JSON from the same readNight, 404 with error body
worker: claude-code · sonnet-5.5 · default
commit: a477bfa
