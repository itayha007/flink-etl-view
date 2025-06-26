
import { TestRun, CreateTestRequest } from '@/types/test';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mock data matching the new service structure
const mockTestRuns: TestRun[] = [
  {
    id: "test-001",
    testCreationTime: "2024-01-15 09:30:00",
    flinkJobStartTime: "2024-01-15 09:32:00",
    flinkJobEndTime: "2024-01-15 09:39:00",
    imageTag: "1.0.0",
    numberOfMessages: 600000,
    currentLag: 30000,
    files: [
      {
        fileName: "compacted-part-0",
        creationTime: "2024-01-15 09:33:30",
        size: 4545454
      },
      {
        fileName: "compacted-part-1",
        creationTime: "2024-01-15 09:34:15",
        size: 3821903
      }
    ],
    logs: [
      "2024-01-15 09:31:00: starting flink e2e",
      "2024-01-15 09:31:30: populatingTopic with messages",
      "2024-01-15 09:32:00: deploying flink deployment",
      "2024-01-15 09:32:00: consuming messages",
      "2024-01-15 09:39:00: test completed successfully"
    ],
    assertions: [
      {
        name: "compacted-part-0",
        status: "PASSED"
      },
      {
        name: "message-count-validation",
        status: "PASSED"
      }
    ],
    testStatus: "PASSED",
    status: "FINISHED"
  },
  {
    id: "test-002", 
    testCreationTime: "2024-01-15 10:15:00",
    flinkJobStartTime: "2024-01-15 10:17:00",
    flinkJobEndTime: "2024-01-15 10:19:45",
    imageTag: "1.1.2",
    numberOfMessages: 250000,
    currentLag: 0,
    files: [],
    logs: [
      "2024-01-15 10:16:00: starting flink e2e",
      "2024-01-15 10:16:30: populatingTopic with messages",
      "2024-01-15 10:17:00: deploying flink deployment",
      "2024-01-15 10:17:30: consuming messages",
      "2024-01-15 10:19:15: ERROR: connection timeout to external service",
      "2024-01-15 10:19:45: test failed due to timeout"
    ],
    assertions: [
      {
        name: "external-service-connection",
        status: "FAILED"
      }
    ],
    testStatus: "FAILED",
    status: "FINISHED"
  },
  {
    id: "test-003",
    testCreationTime: "2024-01-15 11:00:00", 
    flinkJobStartTime: "2024-01-15 11:02:00",
    imageTag: "2.0.0-beta",
    numberOfMessages: 1000000,
    currentLag: 15000,
    files: [
      {
        fileName: "compacted-part-0",
        creationTime: "2024-01-15 11:03:45",
        size: 2341234
      }
    ],
    logs: [
      "2024-01-15 11:01:00: starting flink e2e",
      "2024-01-15 11:01:30: populatingTopic with messages", 
      "2024-01-15 11:02:00: deploying flink deployment",
      "2024-01-15 11:02:30: consuming messages",
      "2024-01-15 11:05:00: processing ongoing... current lag: 15000"
    ],
    assertions: [],
    testStatus: "RUNNING",
    status: "RUNNING"
  }
];

export const api = {
  async getTestRuns(): Promise<TestRun[]> {
    // Skip API call entirely in development when no backend is running
    if (!import.meta.env.VITE_API_URL) {
      console.log('No API URL provided, using mock data');
      return new Promise(resolve => setTimeout(() => resolve(mockTestRuns), 100));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/test/runs`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch test runs');
      }
      return response.json();
    } catch (error) {
      console.log('API not available, using mock data');
      return mockTestRuns;
    }
  },

  async getTestRun(id: string): Promise<TestRun> {
    // Skip API call entirely in development when no backend is running
    if (!import.meta.env.VITE_API_URL) {
      console.log('No API URL provided, using mock data');
      const testRun = mockTestRuns.find(run => run.id === id);
      if (!testRun) {
        throw new Error('Test run not found');
      }
      return new Promise(resolve => setTimeout(() => resolve(testRun), 100));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/test/runs/${id}`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch test run');
      }
      return response.json();
    } catch (error) {
      console.log('API not available, using mock data');
      const testRun = mockTestRuns.find(run => run.id === id);
      if (!testRun) {
        throw new Error('Test run not found');
      }
      return testRun;
    }
  },

  async createTestRun(request: CreateTestRequest): Promise<TestRun> {
    // Skip API call entirely in development when no backend is running
    if (!import.meta.env.VITE_API_URL) {
      console.log('No API URL provided, creating mock test run');
      const newTestRun: TestRun = {
        id: `test-${Date.now()}`,
        testCreationTime: new Date().toLocaleString(),
        flinkJobStartTime: new Date().toLocaleString(),
        imageTag: request.imageTag,
        numberOfMessages: 0,
        currentLag: 0,
        files: [],
        logs: [
          `${new Date().toLocaleString()}: starting flink e2e`,
          `${new Date().toLocaleString()}: populatingTopic with messages`
        ],
        assertions: [],
        testStatus: "RUNNING",
        status: "RUNNING"
      };
      return new Promise(resolve => setTimeout(() => resolve(newTestRun), 100));
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/test/run?image=${encodeURIComponent(request.imageTag)}&testName=${encodeURIComponent(request.testName)}`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to create test run');
      }
      return response.json();
    } catch (error) {
      console.log('API not available, creating mock test run');
      const newTestRun: TestRun = {
        id: `test-${Date.now()}`,
        testCreationTime: new Date().toLocaleString(),
        flinkJobStartTime: new Date().toLocaleString(),
        imageTag: request.imageTag,
        numberOfMessages: 0,
        currentLag: 0,
        files: [],
        logs: [
          `${new Date().toLocaleString()}: starting flink e2e`,
          `${new Date().toLocaleString()}: populatingTopic with messages`
        ],
        assertions: [],
        testStatus: "RUNNING",
        status: "RUNNING"
      };
      return newTestRun;
    }
  },
};
