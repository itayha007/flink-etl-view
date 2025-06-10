
import { TestRun, CreateTestRequest } from '@/types/test';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Mock data for development/demo purposes
const mockTestRuns: TestRun[] = [
  {
    id: '1',
    testName: 'user-behavior-etl-v1',
    imageTag: 'flink-etl:v1.2.3',
    status: 'SUCCESS',
    startTime: '2024-06-10T10:30:00Z',
    endTime: '2024-06-10T10:45:00Z',
    kafkaMessages: [
      '{"userId": "123", "action": "login", "timestamp": "2024-06-10T10:30:15Z"}',
      '{"userId": "456", "action": "purchase", "amount": 99.99, "timestamp": "2024-06-10T10:32:22Z"}',
      '{"userId": "789", "action": "logout", "timestamp": "2024-06-10T10:44:30Z"}'
    ],
    outputFiles: [
      '/hdfs/output/user-behavior/2024/06/10/part-00000-12345.parquet',
      '/hdfs/output/user-behavior/2024/06/10/part-00001-12346.parquet'
    ],
    log: `2024-06-10 10:30:00 INFO  Starting Flink ETL job: user-behavior-etl-v1
2024-06-10 10:30:02 INFO  Connecting to Kafka broker: kafka:9092
2024-06-10 10:30:03 INFO  Created Kafka consumer for topic: user-events
2024-06-10 10:30:05 INFO  Initializing HDFS connection: hdfs://namenode:9000
2024-06-10 10:30:07 INFO  Starting data processing pipeline
2024-06-10 10:30:15 INFO  Processed message: user login event
2024-06-10 10:32:22 INFO  Processed message: purchase event
2024-06-10 10:44:30 INFO  Processed message: user logout event
2024-06-10 10:45:00 INFO  Job completed successfully
2024-06-10 10:45:01 INFO  Written 2 output files to HDFS
2024-06-10 10:45:02 INFO  Total processed records: 1,247`
  },
  {
    id: '2',
    testName: 'order-processing-etl',
    imageTag: 'flink-etl:v1.1.8',
    status: 'FAILED',
    startTime: '2024-06-10T09:15:00Z',
    endTime: '2024-06-10T09:18:45Z',
    kafkaMessages: [
      '{"orderId": "order-001", "customerId": "cust-123", "status": "pending"}',
      '{"orderId": "order-002", "customerId": "cust-456", "status": "processing"}'
    ],
    outputFiles: [],
    log: `2024-06-10 09:15:00 INFO  Starting Flink ETL job: order-processing-etl
2024-06-10 09:15:02 INFO  Connecting to Kafka broker: kafka:9092
2024-06-10 09:15:03 INFO  Created Kafka consumer for topic: order-events
2024-06-10 09:15:05 INFO  Initializing HDFS connection: hdfs://namenode:9000
2024-06-10 09:15:07 INFO  Starting data processing pipeline
2024-06-10 09:16:30 ERROR Failed to connect to external API: timeout after 30s
2024-06-10 09:17:15 ERROR Retrying connection... (attempt 2/3)
2024-06-10 09:18:00 ERROR Retrying connection... (attempt 3/3)
2024-06-10 09:18:45 ERROR Job failed: Unable to establish connection to payment service
2024-06-10 09:18:45 ERROR Rolling back partial changes`
  },
  {
    id: '3',
    testName: 'real-time-analytics',
    imageTag: 'flink-etl:v2.0.1',
    status: 'RUNNING',
    startTime: '2024-06-10T11:00:00Z',
    kafkaMessages: [
      '{"eventType": "page_view", "userId": "user-789", "page": "/dashboard"}',
      '{"eventType": "click", "userId": "user-789", "element": "export-button"}'
    ],
    outputFiles: [],
    log: `2024-06-10 11:00:00 INFO  Starting Flink ETL job: real-time-analytics
2024-06-10 11:00:02 INFO  Connecting to Kafka broker: kafka:9092
2024-06-10 11:00:03 INFO  Created Kafka consumer for topic: analytics-events
2024-06-10 11:00:05 INFO  Initializing HDFS connection: hdfs://namenode:9000
2024-06-10 11:00:07 INFO  Starting data processing pipeline
2024-06-10 11:00:15 INFO  Processed message: page view event
2024-06-10 11:01:22 INFO  Processed message: click event
2024-06-10 11:02:00 INFO  Processing ongoing... Current throughput: 150 events/sec`
  }
];

export const api = {
  async getTestRuns(): Promise<TestRun[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test/runs`);
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
    try {
      const response = await fetch(`${API_BASE_URL}/test/runs/${id}`);
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
    try {
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
    } catch (error) {
      console.log('API not available, creating mock test run');
      // Create a mock test run
      const newTestRun: TestRun = {
        id: Date.now().toString(),
        testName: request.testName,
        imageTag: request.imageTag,
        status: 'RUNNING',
        startTime: new Date().toISOString(),
        kafkaMessages: [],
        outputFiles: [],
        log: `${new Date().toISOString()} INFO  Starting Flink ETL job: ${request.testName}
${new Date().toISOString()} INFO  Connecting to Kafka broker: kafka:9092
${new Date().toISOString()} INFO  Created Kafka consumer for topic: test-events
${new Date().toISOString()} INFO  Initializing HDFS connection: hdfs://namenode:9000
${new Date().toISOString()} INFO  Starting data processing pipeline`
      };
      return newTestRun;
    }
  },
};
