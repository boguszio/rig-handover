---
id: 2
title: "Run log reader: readNight"
state: closed
labels: ["plan:morning-digest"]
created: 2026-10-29T15:05:07Z
closed: 2026-10-29T15:17:35Z
---

Source: plan.md § 1

## Scope
Implement `readNight(runsDir, night)` in `src/digest/`: read `runs/<night>.jsonl` into one row per job (job, owner, runs, retries, last status, last error, first and last time). One JSON object per line (`at`, `job`, `status`: `ok | retry | fail`, `owner`, optional `error`).
- A line that doesn't parse is counted, never thrown. The night still renders.
- `owner` can be `null`: keep the row, show the owner as `—`.
- Keep the log's time offsets; never convert to UTC.

## Done when
Reader tests pass on `runs/2026-10-28.jsonl` (5 jobs, 1 bad line).

## Blocked by
#1

## Closing comment

done: readNight in src/digest/read.ts with tests on 2026-10-28 (5 jobs, 1 bad line)
worker: claude-code · opus-5.5 · default
commit: d2ce238
