
import { spawn } from 'child_process';
import { db } from '../db';
import { speedTestRecordsTable } from '../db/schema';
import { type SpeedTestResult } from '../schema';

export async function runSpeedTest(): Promise<SpeedTestResult> {
  try {
    // Execute speedtest-cli command
    const speedTestOutput = await executeSpeedTest();
    
    // Parse the output to extract speed metrics
    const result = parseSpeedTestOutput(speedTestOutput);
    
    // Store the results in the database
    await db.insert(speedTestRecordsTable)
      .values({
        download_speed: result.download_speed,
        upload_speed: result.upload_speed,
        ping: result.ping
      })
      .execute();
    
    return result;
  } catch (error) {
    console.error('Speed test execution failed:', error);
    throw error;
  }
}

async function executeSpeedTest(): Promise<string> {
  return new Promise((resolve, reject) => {
    const speedtest = spawn('speedtest-cli', ['--simple']);
    let stdout = '';
    let stderr = '';

    speedtest.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    speedtest.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    speedtest.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`speedtest-cli exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    speedtest.on('error', (error) => {
      reject(new Error(`Failed to start speedtest-cli: ${error.message}`));
    });
  });
}

function parseSpeedTestOutput(output: string): SpeedTestResult {
  const lines = output.trim().split('\n');
  
  if (lines.length < 3) {
    throw new Error('Failed to parse speedtest-cli output');
  }

  // Parse simple output format:
  // Ping: 23.456 ms
  // Download: 85.67 Mbit/s
  // Upload: 12.34 Mbit/s
  
  const pingMatch = lines[0].match(/Ping:\s+([\d.]+)\s+ms/);
  const downloadMatch = lines[1].match(/Download:\s+([\d.]+)\s+Mbit\/s/);
  const uploadMatch = lines[2].match(/Upload:\s+([\d.]+)\s+Mbit\/s/);

  if (!pingMatch || !downloadMatch || !uploadMatch) {
    throw new Error('Failed to parse speedtest-cli output');
  }

  return {
    ping: parseFloat(pingMatch[1]),
    download_speed: parseFloat(downloadMatch[1]),
    upload_speed: parseFloat(uploadMatch[1]),
    timestamp: new Date()
  };
}
