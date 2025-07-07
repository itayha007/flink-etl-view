
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
    imageTag: '',
    numberOfMessages: 1000000,
    commitSha: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTestMutation = useMutation({
    mutationFn: api.createTestRun,
    onSuccess: (data) => {
      toast({
        title: "Test Started",
        description: `Test with ID "${data.id}" has been started successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['testRuns'] });
      onOpenChange(false);
      setFormData({ imageTag: '', numberOfMessages: 1000000, commitSha: '' });
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
    if (!formData.imageTag.trim() || !formData.numberOfMessages) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const requestData: CreateTestRequest = {
      imageTag: formData.imageTag,
      numberOfMessages: formData.numberOfMessages,
    };

    if (formData.commitSha?.trim()) {
      requestData.commitSha = formData.commitSha;
    }

    createTestMutation.mutate(requestData);
  };

  const handleInputChange = (field: keyof CreateTestRequest, value: string | number) => {
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
            <Label htmlFor="imageTag">Image Tag *</Label>
            <Input
              id="imageTag"
              placeholder="e.g., flink-etl:v1.2.3"
              value={formData.imageTag}
              onChange={(e) => handleInputChange('imageTag', e.target.value)}
              disabled={createTestMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfMessages">Number of Messages *</Label>
            <Input
              id="numberOfMessages"
              type="number"
              placeholder="e.g., 1000000"
              value={formData.numberOfMessages}
              onChange={(e) => handleInputChange('numberOfMessages', parseInt(e.target.value) || 0)}
              disabled={createTestMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commitSha">Commit SHA (Optional)</Label>
            <Input
              id="commitSha"
              placeholder="e.g., abc123def456"
              value={formData.commitSha}
              onChange={(e) => handleInputChange('commitSha', e.target.value)}
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
