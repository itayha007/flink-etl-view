
import { TestRun, CreateTestRequest } from '@/types/test';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const api = {
  async getTestRuns(): Promise<TestRun[]> {
    const response = await fetch(`${API_BASE_URL}/test/runs`);
    if (!response.ok) {
      throw new Error('Failed to fetch test runs');
    }
    return response.json();
  },

  async getTestRun(id: string): Promise<TestRun> {
    const response = await fetch(`${API_BASE_URL}/test/runs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch test run');
    }
    return response.json();
  },

  async createTestRun(request: CreateTestRequest): Promise<TestRun> {
    const response = await fetch(
      `${API_BASE_URL}/test/run?image=${encodeURIComponent(request.imageTag)}&testName=${encodeURIComponent(request.testName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to create test run');
    }
    return response.json();
  },
};
