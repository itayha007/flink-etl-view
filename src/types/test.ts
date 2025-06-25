
export interface TestFile {
  fileName: string;
  creationTime: string;
  size: number;
}

export interface TestAssertion {
  name: string;
  status: 'PASSED' | 'FAILED';
}

export interface TestRun {
  id: string;
  testCreationTime: string;
  flinkJobStartTime?: string;
  flinkJobEndTime?: string;
  imageTag: string;
  numberOfMessages: number;
  currentLag: number;
  files: TestFile[];
  logs: string[];
  assertions: TestAssertion[];
  testStatus: 'PASSED' | 'FAILED' | 'RUNNING';
  status: 'FINISHED' | 'RUNNING' | 'FAILED';
}

export interface CreateTestRequest {
  testName: string;
  imageTag: string;
}
