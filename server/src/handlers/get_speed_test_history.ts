
import { db } from '../db';
import { speedTestRecordsTable } from '../db/schema';
import { type SpeedTestRecord } from '../schema';
import { desc } from 'drizzle-orm';

export async function getSpeedTestHistory(): Promise<SpeedTestRecord[]> {
  try {
    // Query all speed test records ordered by timestamp (newest first)
    const results = await db.select()
      .from(speedTestRecordsTable)
      .orderBy(desc(speedTestRecordsTable.timestamp))
      .execute();

    // Convert database results to match SpeedTestRecord schema
    // Note: real columns are already numbers, timestamp is already Date
    return results.map(record => ({
      id: record.id,
      timestamp: record.timestamp,
      download_speed: record.download_speed,
      upload_speed: record.upload_speed,
      ping: record.ping
    }));
  } catch (error) {
    console.error('Failed to get speed test history:', error);
    throw error;
  }
}
