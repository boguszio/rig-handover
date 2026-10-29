// Plan morning-digest § 1. The contract every part of § 2 builds against; the reader lives
// next to it in read.ts.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl, after parsing.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job for the night. Times keep the log's offset, never converted to UTC.
export type DigestRow = {
  job: string;
  owner: string | null; // null renders as —
  runs: number;
  retries: number; // lines with status "retry"
  lastStatus: RunStatus;
  lastError: string | null; // error of the job's last line; null when that run had none
  firstAt: string;
  lastAt: string;
};

export type DigestNight = {
  night: string; // YYYY-MM-DD
  rows: DigestRow[]; // sorted by job
  badLines: number; // lines that didn't parse: counted, never thrown
};

// Reads runs/<night>.jsonl. Returns null when the night has no file (the routes answer 404);
// an empty file gives rows: [].
export type ReadNight = (runsDir: string, night: string) => DigestNight | null;
