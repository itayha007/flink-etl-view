
export interface TestRun {
  id: string;
  testName: string;
  imageTag: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  startTime: string;
  endTime?: string;
  kafkaMessages: string[];
  outputFiles: string[];
  log: string;
}

export interface CreateTestRequest {
  testName: string;
  imageTag: string;
}
