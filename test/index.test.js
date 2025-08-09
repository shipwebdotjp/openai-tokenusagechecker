import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock external modules before importing the module under test
vi.mock('../src/configLoader.js', () => {
  return {
    loadConfigFile: vi.fn(),
    mergeConfig: vi.fn((b, o) => ({ ...b, ...o })),
  };
});
vi.mock('../src/usageClient.js', () => {
  return { fetchUsageByModelUTC: vi.fn() };
});
vi.mock('../src/aggregate.js', () => {
  return { aggregateByGroup: vi.fn() };
});
vi.mock('../src/evaluate.js', () => {
  return { evaluateStatus: vi.fn() };
});
vi.mock('../src/notify.js', () => {
  return { sendEmail: vi.fn() };
});

// Import after mocks
import { parseArgs, fmt, printTable, main } from '../src/index.js';
import { loadConfigFile, mergeConfig } from '../src/configLoader.js';
import { fetchUsageByModelUTC } from '../src/usageClient.js';
import { aggregateByGroup } from '../src/aggregate.js';
import { evaluateStatus } from '../src/evaluate.js';
import { sendEmail } from '../src/notify.js';

describe('index utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parseArgs parses flags and values', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'script', '--project', 'myproj', '--flag', '--num', '123'];
    const res = parseArgs();
    expect(res.project).toBe('myproj');
    expect(res.flag).toBe(true);
    expect(res.num).toBe('123');
    process.argv = originalArgv;
  });

  it('fmt formats numbers with commas', () => {
    expect(fmt(1234567)).toBe('1,234,567');
  });

  it('printTable logs a table containing headers and formatted numbers', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const rows = [{ group: 'g', input: 1000, output: 2000, total: 3000, cap: 10000, usagePct: '30.0%', status: 'OK' }];
    printTable(rows);
    expect(spy).toHaveBeenCalled();
    const output = String(spy.mock.calls[0][0]);
    expect(output).toContain('Group');
    expect(output).toContain('3K'); // formatted total
    spy.mockRestore();
  });
});

describe('main flow', () => {
  const origArgv = process.argv.slice();
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Default safe stubs
    loadConfigFile.mockReturnValue({});
    mergeConfig.mockImplementation((b, o) => ({ ...b, ...o }));
    process.argv = ['node', 'script'];
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.argv = origArgv.slice();
    process.env = { ...origEnv };
  });

  it('successful run exits with 0 and does not send email', async () => {
    mergeConfig.mockReturnValue({ project: 'p', tier: 1, admin_key: 'key' });
    fetchUsageByModelUTC.mockResolvedValue(new Map([['gpt-5-2025-08-07', { input: 10, output: 20, total: 30 }]]));
    aggregateByGroup.mockReturnValue({ 'group-1M': { input: 10, output: 20, total: 30 }, 'group-10M': { input: 0, output: 0, total: 0 } });
    evaluateStatus.mockReturnValue({ rows: [{ group: 'group-1M', total: 30, cap: 250000, usagePct: '0.0%', status: 'OK' }], exitCode: 0 });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await main();

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(sendEmail).not.toHaveBeenCalled();

    exitSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('alert run sends email and exits with non-zero', async () => {
    mergeConfig.mockReturnValue({ project: 'p', tier: 1, admin_key: 'key', email: 'a@b' });
    fetchUsageByModelUTC.mockResolvedValue(new Map([['gpt-5-2025-08-07', { input: 999999, output: 0, total: 999999 }]]));
    aggregateByGroup.mockReturnValue({ 'group-1M': { input: 999999, output: 0, total: 999999 }, 'group-10M': { input: 0, output: 0, total: 0 } });
    evaluateStatus.mockReturnValue({ rows: [{ group: 'group-1M', total: 999999, cap: 250000, usagePct: '400.0%', status: 'OVER' }], exitCode: 2 });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    await main();

    expect(exitSpy).toHaveBeenCalledWith(2);
    expect(sendEmail).toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  it('handles fetch error and exits with code 2', async () => {
    mergeConfig.mockReturnValue({ project: 'p', tier: 1, admin_key: 'key' });
    fetchUsageByModelUTC.mockRejectedValue(new Error('boom'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await main();

    expect(exitSpy).toHaveBeenCalledWith(2);

    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('missing project triggers exit 1', async () => {
    // merged config does not include project
    mergeConfig.mockReturnValue({});
    // Make process.exit throw so we can assert the code without letting main continue
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => { throw new Error('EXIT:' + code); });
    try {
      await main();
      // If main does not throw, fail the test
      throw new Error('main did not exit as expected');
    } catch (err) {
      expect(String(err)).toContain('EXIT:1');
    } finally {
      exitSpy.mockRestore();
    }
  });

  it('missing apiKey triggers exit 1', async () => {
    // Provide project but no admin_key / env var
    mergeConfig.mockReturnValue({ project: 'p' });
    // Ensure no OPENAI_ADMIN_KEY in env
    delete process.env.OPENAI_ADMIN_KEY;

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => { throw new Error('EXIT:' + code); });
    try {
      await main();
      throw new Error('main did not exit as expected');
    } catch (err) {
      expect(String(err)).toContain('EXIT:1');
    } finally {
      exitSpy.mockRestore();
    }
  });
});
