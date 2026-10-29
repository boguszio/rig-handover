import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nightCounts } from '../src/digest/counts.js';

describe('nightCounts', () => {
  it('counts lines by status for a real night', () => {
    const c = nightCounts('runs', '2026-10-28');
    expect(c).not.toBeNull();
    expect(c!.ok + c!.retry + c!.fail).toBeGreaterThan(0);
  });
  it('is null for a missing night', () => {
    expect(nightCounts(mkdtempSync(join(tmpdir(), 'rig-')), '2026-01-01')).toBeNull();
  });
});
