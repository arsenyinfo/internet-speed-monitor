
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { speedTestRecordsTable } from '../db/schema';
import { getSpeedTestHistory } from '../handlers/get_speed_test_history';

describe('getSpeedTestHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no records exist', async () => {
    const result = await getSpeedTestHistory();
    
    expect(result).toEqual([]);
  });

  it('should return all speed test records', async () => {
    // Insert test records
    await db.insert(speedTestRecordsTable)
      .values([
        {
          download_speed: 100.5,
          upload_speed: 50.2,
          ping: 15.8
        },
        {
          download_speed: 95.3,
          upload_speed: 48.7,
          ping: 12.4
        }
      ])
      .execute();

    const result = await getSpeedTestHistory();

    expect(result).toHaveLength(2);
    
    // Verify structure and types
    expect(result[0].id).toBeDefined();
    expect(typeof result[0].id).toBe('number');
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(typeof result[0].download_speed).toBe('number');
    expect(typeof result[0].upload_speed).toBe('number');
    expect(typeof result[0].ping).toBe('number');
  });

  it('should return records ordered by timestamp (newest first)', async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Insert records with specific timestamps
    await db.insert(speedTestRecordsTable)
      .values([
        {
          timestamp: twoHoursAgo,
          download_speed: 80.0,
          upload_speed: 40.0,
          ping: 20.0
        },
        {
          timestamp: now,
          download_speed: 100.0,
          upload_speed: 50.0,
          ping: 10.0
        },
        {
          timestamp: oneHourAgo,
          download_speed: 90.0,
          upload_speed: 45.0,
          ping: 15.0
        }
      ])
      .execute();

    const result = await getSpeedTestHistory();

    expect(result).toHaveLength(3);
    
    // Verify newest record is first
    expect(result[0].download_speed).toBe(100.0);
    expect(result[0].timestamp.getTime()).toBe(now.getTime());
    
    // Verify middle record is second
    expect(result[1].download_speed).toBe(90.0);
    expect(result[1].timestamp.getTime()).toBe(oneHourAgo.getTime());
    
    // Verify oldest record is last
    expect(result[2].download_speed).toBe(80.0);
    expect(result[2].timestamp.getTime()).toBe(twoHoursAgo.getTime());
  });

  it('should preserve exact speed values', async () => {
    const testRecord = {
      download_speed: 123.456,
      upload_speed: 67.890,
      ping: 9.123
    };

    await db.insert(speedTestRecordsTable)
      .values(testRecord)
      .execute();

    const result = await getSpeedTestHistory();

    expect(result).toHaveLength(1);
    expect(result[0].download_speed).toBe(123.456);
    expect(result[0].upload_speed).toBe(67.890);
    expect(result[0].ping).toBe(9.123);
  });
});
