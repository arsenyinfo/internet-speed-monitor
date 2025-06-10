
import { serial, pgTable, timestamp, real } from 'drizzle-orm/pg-core';

export const speedTestRecordsTable = pgTable('speed_test_records', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  download_speed: real('download_speed').notNull(), // Mbps as float
  upload_speed: real('upload_speed').notNull(), // Mbps as float
  ping: real('ping').notNull() // ms as float
});

// TypeScript type for the table schema
export type SpeedTestRecord = typeof speedTestRecordsTable.$inferSelect; // For SELECT operations
export type NewSpeedTestRecord = typeof speedTestRecordsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { speedTestRecords: speedTestRecordsTable };
