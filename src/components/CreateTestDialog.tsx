
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { CreateTestRequest } from '@/types/test';

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTestDialog = ({ open, onOpenChange }: CreateTestDialogProps) => {
  const [formData, setFormData] = useState<CreateTestRequest>({
    testName: '',
    imageTag: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTestMutation = useMutation({
    mutationFn: api.createTestRun,
    onSuccess: (data) => {
      toast({
        title: "Test Started",
        description: `Test "${data.testName}" has been started successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['testRuns'] });
      onOpenChange(false);
      setFormData({ testName: '', imageTag: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start test",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testName.trim() || !formData.imageTag.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createTestMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateTestRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Run New Test</DialogTitle>
          <DialogDescription>
            Start a new Flink ETL pipeline test. Make sure the image tag is available in your registry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              placeholder="e.g., user-behavior-etl-v1"
              value={formData.testName}
              onChange={(e) => handleInputChange('testName', e.target.value)}
              disabled={createTestMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageTag">Image Tag</Label>
            <Input
              id="imageTag"
              placeholder="e.g., flink-etl:v1.2.3"
              value={formData.imageTag}
              onChange={(e) => handleInputChange('imageTag', e.target.value)}
              disabled={createTestMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTestMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTestMutation.isPending}
            >
              {createTestMutation.isPending ? 'Starting...' : 'Start Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
