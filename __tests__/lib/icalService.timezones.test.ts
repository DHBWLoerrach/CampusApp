import { spawn } from 'child_process';
import path from 'path';

// All Jest tests share the timezone of the process, and assigning
// process.env.TZ at runtime does not change it. Run the all-day suite in a
// separate Jest process per device timezone instead.
const DEVICE_TIME_ZONES = [
  'UTC',
  'Asia/Tokyo',
  'Pacific/Auckland',
  'America/Los_Angeles',
];

const ROOT = path.resolve(__dirname, '../..');
const SUITE = path.join(__dirname, 'icalService.allDay.test.ts');
const JEST_BIN = path.join(ROOT, 'node_modules/jest/bin/jest.js');

interface SuiteRun {
  code: number | null;
  output: string;
}

interface JestJsonResult {
  numPassedTests: number;
  numFailedTests: number;
  testResults: { assertionResults: { ancestorTitles: string[] }[] }[];
}

function runSuite(timeZone: string): Promise<SuiteRun> {
  return new Promise((resolve) => {
    const env: NodeJS.ProcessEnv = { ...process.env, TZ: timeZone };
    delete env.JEST_WORKER_ID;

    const child = spawn(
      process.execPath,
      [JEST_BIN, '--runTestsByPath', SUITE, '--ci', '--json'],
      { cwd: ROOT, env }
    );
    // --json writes the machine-readable result to stdout
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.on('close', (code) => resolve({ code, output }));
  });
}

describe('icalService all-day events in other device timezones', () => {
  const runs = new Map<string, SuiteRun>();

  beforeAll(async () => {
    const results = await Promise.all(DEVICE_TIME_ZONES.map(runSuite));
    DEVICE_TIME_ZONES.forEach((timeZone, i) => runs.set(timeZone, results[i]));
  }, 120_000);

  it.each(DEVICE_TIME_ZONES)('passes with TZ=%s', (timeZone) => {
    const run = runs.get(timeZone);
    const result = JSON.parse(run?.output ?? '{}') as JestJsonResult;
    const suiteTitles = result.testResults.flatMap((file) =>
      file.assertionResults.map((assertion) => assertion.ancestorTitles[0])
    );

    // Guards against the suite silently running in the host timezone
    expect(suiteTitles).toContain(
      `icalService all-day events (device timezone ${timeZone})`
    );
    expect(result.numFailedTests).toBe(0);
    expect(result.numPassedTests).toBeGreaterThan(0);
    expect(run?.code).toBe(0);
  });
});
