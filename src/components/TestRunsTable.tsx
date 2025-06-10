
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TestRun } from '@/types/test';
import { formatDistanceToNow } from 'date-fns';

interface TestRunsTableProps {
  testRuns: TestRun[];
  isLoading: boolean;
}

export const TestRunsTable = ({ testRuns, isLoading }: TestRunsTableProps) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: TestRun['status']) => {
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

  const getStatusIcon = (status: TestRun['status']) => {
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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      absolute: date.toLocaleString(),
      relative: formatDistanceToNow(date, { addSuffix: true }),
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4 items-center">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-6 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        ))}
      </div>
    );
  }

  if (testRuns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No test runs found</p>
        <p className="text-muted-foreground">Click "Run New Test" to get started</p>
      </div>
    );
  }

  // Sort by start time (most recent first)
  const sortedTestRuns = [...testRuns].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Name</TableHead>
            <TableHead>Image Tag</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTestRuns.map((testRun) => {
            const startTime = formatDateTime(testRun.startTime);
            const endTime = testRun.endTime ? formatDateTime(testRun.endTime) : null;

            return (
              <TableRow 
                key={testRun.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/test/${testRun.id}`)}
              >
                <TableCell className="font-medium">
                  {testRun.testName}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {testRun.imageTag}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(testRun.status)}>
                    {getStatusIcon(testRun.status)} {testRun.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{startTime.absolute}</div>
                    <div className="text-xs text-muted-foreground">{startTime.relative}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {endTime ? (
                    <div className="space-y-1">
                      <div className="text-sm">{endTime.absolute}</div>
                      <div className="text-xs text-muted-foreground">{endTime.relative}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/test/${testRun.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
