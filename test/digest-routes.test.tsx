import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { DigestNight } from '../src/digest/types.js';

// A temp runs dir: runs/ is read-only and never written to.
let runsDir: string;

const line = (at: string, job: string, status: string, owner: string | null, error?: string) =>
  JSON.stringify(error === undefined ? { at, job, status, owner } : { at, job, status, owner, error });

beforeAll(() => {
  runsDir = mkdtempSync(join(tmpdir(), 'digest-routes-'));
  writeFileSync(
    join(runsDir, '2026-01-02.jsonl'),
    [
      // a/job: one retry with an error, then ok
      line('2026-01-02T01:00:00+01:00', 'a/job', 'retry', 'rook', 'timeout'),
      line('2026-01-02T01:30:00+01:00', 'a/job', 'ok', 'rook'),
      // b/job: fails, no owner
      line('2026-01-02T02:00:00+01:00', 'b/job', 'fail', null, 'quota exceeded'),
      // c/job: three retries, then ok (retries = 3)
      line('2026-01-02T03:00:00+01:00', 'c/job', 'retry', 'rook'),
      line('2026-01-02T03:10:00+01:00', 'c/job', 'retry', 'rook'),
      line('2026-01-02T03:20:00+01:00', 'c/job', 'retry', 'rook'),
      line('2026-01-02T03:30:00+01:00', 'c/job', 'ok', 'rook'),
      // truncated line: one bad line
      '{"at":"2026-01-02T05:00:00+01:00","job":"x',
    ].join('\n') + '\n',
  );
  writeFileSync(join(runsDir, '2026-01-03.jsonl'), '');
});

afterAll(() => {
  rmSync(runsDir, { recursive: true, force: true });
});

const config = {
  adapter: 'shim',
  installed: '2026-10-29T14:06:00+01:00',
  beatEverySeconds: 60,
  get runsDir() {
    return runsDir;
  },
};

// Table rows (<tr>...</tr>) in the order they appear in the page.
function tableRows(html: string): string[] {
  return html.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
}

// The job names in the page, in the order they first appear.
function jobOrderInPage(html: string): string[] {
  const jobs = ['a/job', 'b/job', 'c/job'];
  return jobs
    .filter((job) => html.includes(job))
    .sort((x, y) => html.indexOf(x) - html.indexOf(y));
}

describe('GET /digest/:night', () => {
  it('renders a table for a night with runs (200)', async () => {
    const res = await createApp(config).request('/digest/2026-01-02');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('<table');
    expect(html).toContain('a/job');
    expect(html).toContain('b/job');
    expect(html).toContain('c/job');
  });

  it('marks rows with retries >= 3 or a fail as warn, and not the others', async () => {
    const html = await (await createApp(config).request('/digest/2026-01-02')).text();
    const rows = tableRows(html);
    const rowFor = (job: string) => rows.find((r) => r.includes(job)) ?? '';
    expect(rowFor('a/job')).not.toContain('class="warn"');
    expect(rowFor('b/job')).toContain('class="warn"');
    expect(rowFor('c/job')).toContain('class="warn"');
  });

  it('renders a null owner as —', async () => {
    const html = await (await createApp(config).request('/digest/2026-01-02')).text();
    const rowB = tableRows(html).find((r) => r.includes('b/job')) ?? '';
    expect(rowB).toContain('—');
  });

  it('shows rows sorted by job', async () => {
    const html = await (await createApp(config).request('/digest/2026-01-02')).text();
    expect(jobOrderInPage(html)).toEqual(['a/job', 'b/job', 'c/job']);
  });

  it('says how many lines did not parse', async () => {
    const html = await (await createApp(config).request('/digest/2026-01-02')).text();
    expect(html).toMatch(/1 line didn(&#39;|')t parse/);
  });

  it('renders "nothing ran" for the empty night (200)', async () => {
    const res = await createApp(config).request('/digest/2026-01-03');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('nothing ran');
  });

  it('answers 404 for a night with no file', async () => {
    const res = await createApp(config).request('/digest/2026-01-04');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/digest/:night', () => {
  it('returns { night, rows, badLines } (200)', async () => {
    const res = await createApp(config).request('/api/digest/2026-01-02');
    expect(res.status).toBe(200);
    const body = (await res.json()) as DigestNight;
    expect(body.night).toBe('2026-01-02');
    expect(body.badLines).toBe(1);
    expect(body.rows.map((r) => r.job)).toEqual(['a/job', 'b/job', 'c/job']);
  });

  it('gives the right counts and keeps owner null', async () => {
    const body = (await (await createApp(config).request('/api/digest/2026-01-02')).json()) as DigestNight;
    const row = (job: string) => body.rows.find((r) => r.job === job);
    expect(row('a/job')).toMatchObject({ owner: 'rook', runs: 2, retries: 1, lastStatus: 'ok' });
    expect(row('b/job')).toMatchObject({ owner: null, runs: 1, lastStatus: 'fail', lastError: 'quota exceeded' });
    expect(row('c/job')).toMatchObject({ runs: 4, retries: 3, lastStatus: 'ok' });
  });

  it('returns an empty night with no rows and no bad lines (200)', async () => {
    const res = await createApp(config).request('/api/digest/2026-01-03');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ night: '2026-01-03', rows: [], badLines: 0 });
  });

  it('answers 404 with the error body for a night with no file', async () => {
    const res = await createApp(config).request('/api/digest/2026-01-04');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'no run log', night: '2026-01-04' });
  });

  it('gives the same job order as the page', async () => {
    const html = await (await createApp(config).request('/digest/2026-01-02')).text();
    const body = (await (await createApp(config).request('/api/digest/2026-01-02')).json()) as DigestNight;
    expect(jobOrderInPage(html)).toEqual(body.rows.map((r) => r.job));
  });
});
