
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
      case 'SUCCESS':
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
      case 'SUCCESS':
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
    if (!testRun?.log) return;
    
    const blob = new Blob([testRun.log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testRun.testName}-logs.txt`;
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
    const date = new Date(dateTime);
    return {
      absolute: date.toLocaleString(),
      relative: formatDistanceToNow(date, { addSuffix: true }),
    };
  };

  const startTime = formatDateTime(testRun.startTime);
  const endTime = testRun.endTime ? formatDateTime(testRun.endTime) : null;

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
              <h1 className="text-3xl font-bold text-foreground">{testRun.testName}</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Start Time</h4>
                <p className="text-sm">{startTime.absolute}</p>
                <p className="text-xs text-muted-foreground">{startTime.relative}</p>
              </div>
              {endTime && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">End Time</h4>
                  <p className="text-sm">{endTime.absolute}</p>
                  <p className="text-xs text-muted-foreground">{endTime.relative}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Logs</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(testRun.log)}
                disabled={!testRun.log}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadLogs}
                disabled={!testRun.log}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={testRun.log || 'No logs available'}
              readOnly
              className="min-h-[300px] font-mono text-sm resize-none"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kafka Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Kafka Messages ({testRun.kafkaMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testRun.kafkaMessages.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testRun.kafkaMessages.map((message, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Message {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {message}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No Kafka messages recorded
                </p>
              )}
            </CardContent>
          </Card>

          {/* Output Files */}
          <Card>
            <CardHeader>
              <CardTitle>Output HDFS Files ({testRun.outputFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testRun.outputFiles.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testRun.outputFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="font-mono text-sm truncate flex-1 mr-2">
                        {file}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(file)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No output files generated
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
