
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const TestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: testRun, isLoading, error } = useQuery({
    queryKey: ['testRun', id],
    queryFn: () => api.getTestRun(id!),
    enabled: !!id,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'FINISHED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'RUNNING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINISHED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'RUNNING':
        return '⏳';
      default:
        return '❔';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const downloadLogs = () => {
    if (!testRun?.logs || testRun.logs.length === 0) return;
    
    const logsText = testRun.logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testRun.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-60 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testRun) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load test details. Please try again.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        return {
          absolute: dateTime,
          relative: 'Invalid date',
        };
      }
      return {
        absolute: date.toLocaleString(),
        relative: formatDistanceToNow(date, { addSuffix: true }),
      };
    } catch (error) {
      return {
        absolute: dateTime,
        relative: 'Invalid date',
      };
    }
  };

  const startTime = formatDateTime(testRun.flinkJobStartTime || testRun.testCreationTime);
  const endTime = testRun.flinkJobEndTime ? formatDateTime(testRun.flinkJobEndTime) : null;
  const logsText = testRun.logs.join('\n');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{testRun.id}</h1>
              <p className="text-muted-foreground mt-1">
                Image: <span className="font-mono">{testRun.imageTag}</span>
              </p>
            </div>
            <Badge variant={getStatusVariant(testRun.status)} className="text-lg px-4 py-2">
              {getStatusIcon(testRun.status)} {testRun.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Test Info */}
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Test Creation Time</h4>
                <p className="text-sm">{formatDateTime(testRun.testCreationTime).absolute}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(testRun.testCreationTime).relative}</p>
              </div>
              {testRun.flinkJobStartTime && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Flink Job Start Time</h4>
                  <p className="text-sm">{startTime.absolute}</p>
                  <p className="text-xs text-muted-foreground">{startTime.relative}</p>
                </div>
              )}
              {endTime && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Flink Job End Time</h4>
                  <p className="text-sm">{endTime.absolute}</p>
                  <p className="text-xs text-muted-foreground">{endTime.relative}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-foreground mb-2">Number of Messages</h4>
                <p className="text-sm">{testRun.numberOfMessages.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Current Lag</h4>
                <p className="text-sm">{testRun.currentLag.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Logs ({testRun.logs.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(logsText)}
                disabled={testRun.logs.length === 0}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadLogs}
                disabled={testRun.logs.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={logsText || 'No logs available'}
              readOnly
              className="min-h-[300px] font-mono text-sm resize-none"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Files ({testRun.files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testRun.files.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testRun.files.map((file, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {file.fileName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(file.fileName)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        <div>Created: {formatDateTime(file.creationTime).absolute}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No files generated yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Assertions */}
          <Card>
            <CardHeader>
              <CardTitle>Assertions ({testRun.assertions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testRun.assertions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testRun.assertions.map((assertion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="font-mono text-sm flex-1">
                        {assertion.name}
                      </span>
                      <Badge variant={assertion.status === 'PASSED' ? 'default' : 'destructive'}>
                        {assertion.status === 'PASSED' ? '✅' : '❌'} {assertion.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No assertions completed yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
