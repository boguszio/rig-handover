---
id: 1
title: "Digest types: DigestRow and readNight signature"
state: closed
labels: ["plan:morning-digest"]
created: 2026-10-29T15:03:05Z
closed: 2026-10-29T15:17:35Z
---

Source: plan.md § 1

## Scope
Commit `src/digest/types.ts` before the reader: the `DigestRow` type (job, owner, runs, retries, last status, last error, first and last time) and the `readNight(runsDir, night)` signature. Every part of § 2 starts against this file.

## Done when
`src/digest/types.ts` is on `main` and `pnpm typecheck` passes.

## Blocked by
—

## Closing comment

done: added src/digest/types.ts (DigestRow, DigestNight, readNight signature)
worker: claude-code · opus-5.5 · medium
commit: 9799d60
