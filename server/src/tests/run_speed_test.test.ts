
import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { speedTestRecordsTable } from '../db/schema';
import { runSpeedTest } from '../handlers/run_speed_test';
import * as cp from 'child_process';

describe('runSpeedTest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should run speed test and return results', async () => {
    // Mock successful speedtest-cli execution
    const mockProcess = {
      stdout: { on: mock() },
      stderr: { on: mock() },
      on: mock()
    };

    const spawnSpy = spyOn(cp, 'spawn').mockReturnValue(mockProcess as any);

    // Set up mock behavior
    mockProcess.stdout.on.mockImplementation((event: string, callback: any) => {
      if (event === 'data') {
        callback(Buffer.from('Ping: 23.456 ms\nDownload: 85.67 Mbit/s\nUpload: 12.34 Mbit/s\n'));
      }
    });

    mockProcess.stderr.on.mockImplementation(() => {});

    mockProcess.on.mockImplementation((event: string, callback: any) => {
      if (event === 'close') {
        callback(0); // Success exit code
      }
    });

    const result = await runSpeedTest();

    // Verify parsed results
    expect(result.ping).toEqual(23.456);
    expect(result.download_speed).toEqual(85.67);
    expect(result.upload_speed).toEqual(12.34);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(typeof result.ping).toBe('number');
    expect(typeof result.download_speed).toBe('number');
    expect(typeof result.upload_speed).toBe('number');

    spawnSpy.mockRestore();
  });

  it('should save speed test results to database', async () => {
    // Mock successful speedtest-cli execution
    const mockProcess = {
      stdout: { on: mock() },
      stderr: { on: mock() },
      on: mock()
    };

    const spawnSpy = spyOn(cp, 'spawn').mockReturnValue(mockProcess as any);

    // Set up mock behavior
    mockProcess.stdout.on.mockImplementation((event: string, callback: any) => {
      if (event === 'data') {
        callback(Buffer.from('Ping: 23.456 ms\nDownload: 85.67 Mbit/s\nUpload: 12.34 Mbit/s\n'));
      }
    });

    mockProcess.stderr.on.mockImplementation(() => {});

    mockProcess.on.mockImplementation((event: string, callback: any) => {
      if (event === 'close') {
        callback(0); // Success exit code
      }
    });

    await runSpeedTest();

    // Query the database to verify record was saved
    const records = await db.select()
      .from(speedTestRecordsTable)
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].ping).toEqual(23.456);
    expect(records[0].download_speed).toEqual(85.67);
    expect(records[0].upload_speed).toEqual(12.34);
    expect(records[0].timestamp).toBeInstanceOf(Date);

    spawnSpy.mockRestore();
  });

  it('should handle speedtest-cli process errors', async () => {
    // Mock spawn to simulate process error
    const mockProcess = {
      stdout: { on: mock() },
      stderr: { on: mock() },
      on: mock()
    };

    const spawnSpy = spyOn(cp, 'spawn').mockReturnValue(mockProcess as any);

    mockProcess.stdout.on.mockImplementation(() => {});
    mockProcess.stderr.on.mockImplementation(() => {});

    mockProcess.on.mockImplementation((event: string, callback: any) => {
      if (event === 'error') {
        callback(new Error('Command not found'));
      }
    });

    await expect(runSpeedTest()).rejects.toThrow(/Failed to start speedtest-cli/);

    spawnSpy.mockRestore();
  });

  it('should handle invalid speedtest output format', async () => {
    // Mock spawn to return invalid output
    const mockProcess = {
      stdout: { on: mock() },
      stderr: { on: mock() },
      on: mock()
    };

    const spawnSpy = spyOn(cp, 'spawn').mockReturnValue(mockProcess as any);

    mockProcess.stdout.on.mockImplementation((event: string, callback: any) => {
      if (event === 'data') {
        callback(Buffer.from('Invalid output format\n'));
      }
    });

    mockProcess.stderr.on.mockImplementation(() => {});

    mockProcess.on.mockImplementation((event: string, callback: any) => {
      if (event === 'close') {
        callback(0);
      }
    });

    await expect(runSpeedTest()).rejects.toThrow(/Failed to parse speedtest-cli output/);

    spawnSpy.mockRestore();
  });
});
