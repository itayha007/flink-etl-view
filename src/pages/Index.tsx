
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestRunsTable } from '@/components/TestRunsTable';
import { CreateTestDialog } from '@/components/CreateTestDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { 
    data: testRuns = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['testRuns'],
    queryFn: api.getTestRuns,
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Test runs data has been refreshed",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load test runs. Please try again.</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Flink ETL Test Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage automated ETL pipeline tests
              </p>
            </div>
            <div className="flex gap-3">
              <ThemeToggle />
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Run New Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <TestRunsTable 
              testRuns={testRuns} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>

      <CreateTestDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Index;
