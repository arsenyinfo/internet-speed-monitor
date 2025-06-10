
import { z } from 'zod';

// Speed test record schema
export const speedTestRecordSchema = z.object({
  id: z.number(),
  timestamp: z.coerce.date(),
  download_speed: z.number(), // Mbps
  upload_speed: z.number(), // Mbps
  ping: z.number() // ms
});

export type SpeedTestRecord = z.infer<typeof speedTestRecordSchema>;

// Input schema for creating speed test records
export const createSpeedTestRecordInputSchema = z.object({
  download_speed: z.number().positive(),
  upload_speed: z.number().positive(),
  ping: z.number().positive()
});

export type CreateSpeedTestRecordInput = z.infer<typeof createSpeedTestRecordInputSchema>;

// Speed test result schema (output from speedtest-cli parsing)
export const speedTestResultSchema = z.object({
  download_speed: z.number(),
  upload_speed: z.number(),
  ping: z.number(),
  timestamp: z.coerce.date()
});

export type SpeedTestResult = z.infer<typeof speedTestResultSchema>;
