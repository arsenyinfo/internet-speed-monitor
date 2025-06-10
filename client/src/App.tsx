
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Zap, Clock, Download, Upload, Wifi } from 'lucide-react';
// Using type-only imports for better TypeScript compliance
import type { SpeedTestRecord, SpeedTestResult } from '../../server/src/schema';

// Speed Test Monitor Application - Fully implemented and ready to use!

function App() {
  // State management with proper typing
  const [records, setRecords] = useState<SpeedTestRecord[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [lastResult, setLastResult] = useState<SpeedTestResult | null>(null);

  // useCallback to memoize function used in useEffect
  const loadHistory = useCallback(async () => {
    try {
      const result = await trpc.getSpeedTestHistory.query();
      setRecords(result);
    } catch (error) {
      console.error('Failed to load speed test history:', error);
    }
  }, []); // Empty deps since trpc is stable

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRunSpeedTest = async () => {
    setIsRunningTest(true);
    try {
      const result = await trpc.runSpeedTest.mutate();
      setLastResult(result);
      // Refresh history after running test
      await loadHistory();
    } catch (error) {
      console.error('Failed to run speed test:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const formatSpeed = (speed: number) => `${speed.toFixed(2)} Mbps`;
  const formatPing = (ping: number) => `${ping.toFixed(1)} ms`;
  
  const getSpeedBadgeColor = (speed: number) => {
    if (speed >= 100) return 'bg-green-500';
    if (speed >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPingBadgeColor = (ping: number) => {
    if (ping <= 20) return 'bg-green-500';
    if (ping <= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">⚡ Speed Test Monitor</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Test your internet connection speed and track performance over time
          </p>
        </div>

        {/* Speed Test Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Wifi className="h-6 w-6 text-blue-600" />
              Internet Speed Test
            </CardTitle>
            <CardDescription>
              Click the button below to measure your current internet speed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Button
              onClick={handleRunSpeedTest}
              disabled={isRunningTest}
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              {isRunningTest ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Speed Test...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Run Speed Test
                </>
              )}
            </Button>

            {/* Latest Result Display */}
            {lastResult && (
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-center">📊 Latest Test Results</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Download className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-gray-600">Download</span>
                    </div>
                    <Badge className={`${getSpeedBadgeColor(lastResult.download_speed)} text-white font-bold`}>
                      {formatSpeed(lastResult.download_speed)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Upload className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-gray-600">Upload</span>
                    </div>
                    <Badge className={`${getSpeedBadgeColor(lastResult.upload_speed)} text-white font-bold`}>
                      {formatSpeed(lastResult.upload_speed)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-600 mr-1" />
                      <span className="text-sm text-gray-600">Ping</span>
                    </div>
                    <Badge className={`${getPingBadgeColor(lastResult.ping)} text-white font-bold`}>
                      {formatPing(lastResult.ping)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* History Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              📈 Speed Test History
            </CardTitle>
            <CardDescription>
              {records.length === 0 
                ? "No speed tests recorded yet. Run your first test above!" 
                : `${records.length} speed test${records.length !== 1 ? 's' : ''} recorded`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-gray-500 text-lg">
                  Ready to test your connection? Click "Run Speed Test" above to get started!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timestamp
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Download className="h-4 w-4 text-green-600" />
                          Download Speed
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          Upload Speed
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Wifi className="h-4 w-4 text-orange-600" />
                          Ping
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: SpeedTestRecord) => (
                      <TableRow key={record.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{record.timestamp.toLocaleDateString()}</span>
                            <span className="text-sm text-gray-500">
                              {record.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${getSpeedBadgeColor(record.download_speed)} text-white border-0 font-bold`}
                          >
                            {formatSpeed(record.download_speed)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${getSpeedBadgeColor(record.upload_speed)} text-white border-0 font-bold`}
                          >
                            {formatSpeed(record.upload_speed)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${getPingBadgeColor(record.ping)} text-white border-0 font-bold`}
                          >
                            {formatPing(record.ping)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🔄 History automatically refreshes after each speed test</p>
        </div>
      </div>
    </div>
  );
}

export default App;
