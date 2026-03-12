/**
 * k6 Load Test Script - Library Management API
 * Phase 6 - Performance Testing
 *
 * Requirements:
 * - Load: 100 requests/second
 * - Duration: 2 minutes
 *
 * Install k6:
 *   Windows: choco install k6
 *   Mac: brew install k6
 *   Linux: https://k6.io/docs/getting-started/installation/
 *
 * Run:
 *   k6 run tests/load-test.js
 *
 * Run with output to file:
 *   k6 run --out json=results.json tests/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// =============================================================================
// Custom Metrics
// =============================================================================

const booksFetched = new Counter('books_fetched');
const requestsFailed = new Rate('requests_failed');
const bookListDuration = new Trend('book_list_duration');
const healthCheckDuration = new Trend('health_check_duration');

// =============================================================================
// Test Configuration
// =============================================================================

export const options = {
  scenarios: {
    // Main load test scenario - 100 req/s for 2 minutes
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100,              // 100 requests per second
      timeUnit: '1s',
      duration: '2m',         // Run for 2 minutes
      preAllocatedVUs: 50,    // Pre-allocate 50 virtual users
      maxVUs: 200,            // Max 200 virtual users
    },
  },
  thresholds: {
    // Response time thresholds
    http_req_duration: [
      'p(50)<100',    // 50% of requests should be below 100ms
      'p(95)<300',    // 95% of requests should be below 300ms
      'p(99)<500',    // 99% of requests should be below 500ms
    ],
    // Error rate threshold
    http_req_failed: ['rate<0.01'],  // Error rate should be below 1%
    // Custom metrics thresholds
    requests_failed: ['rate<0.01'],
  },
};

// =============================================================================
// Configuration
// =============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_V1 = `${BASE_URL}/api/v1`;

// Test user credentials (for authenticated endpoints)
let authToken = '';

// =============================================================================
// Setup Function - Runs once before the test
// =============================================================================

export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);

  // Health check before starting
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Service is not healthy! Status: ${healthRes.status}`);
  }

  // Try to register/login a test user for authenticated requests
  const testUser = {
    email: `loadtest_${Date.now()}@test.com`,
    password: 'TestPassword123!',
    nom: 'Load',
    prenom: 'Test',
  };

  // Register user
  const registerRes = http.post(`${API_V1}/auth/register`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerRes.status === 201 || registerRes.status === 200) {
    try {
      const body = JSON.parse(registerRes.body);
      authToken = body.data?.token || body.token || '';
    } catch (e) {
      console.warn('Could not parse register response');
    }
  }

  // If registration failed, try login
  if (!authToken) {
    const loginRes = http.post(`${API_V1}/auth/login`, JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginRes.status === 200) {
      try {
        const body = JSON.parse(loginRes.body);
        authToken = body.data?.token || body.token || '';
      } catch (e) {
        console.warn('Could not parse login response');
      }
    }
  }

  return { authToken };
}

// =============================================================================
// Main Test Function - Runs for each virtual user iteration
// =============================================================================

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (data.authToken) {
    headers['Authorization'] = `Bearer ${data.authToken}`;
  }

  // Randomly choose which endpoint to test (weighted distribution)
  const rand = Math.random();

  if (rand < 0.40) {
    // 40% - Get all books (most common operation)
    testGetBooks(headers);
  } else if (rand < 0.60) {
    // 20% - Health check
    testHealthCheck();
  } else if (rand < 0.75) {
    // 15% - Get single book
    testGetSingleBook(headers);
  } else if (rand < 0.85) {
    // 10% - Get metrics
    testMetrics();
  } else if (rand < 0.95) {
    // 10% - Search books
    testSearchBooks(headers);
  } else {
    // 5% - Auth endpoints
    testAuthEndpoints();
  }
}

// =============================================================================
// Test Functions
// =============================================================================

function testGetBooks(headers) {
  group('GET /api/v1/books', () => {
    const startTime = Date.now();
    const res = http.get(`${API_V1}/books`, { headers });
    const duration = Date.now() - startTime;

    bookListDuration.add(duration);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data !== undefined || Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    if (success) {
      try {
        const body = JSON.parse(res.body);
        const count = body.data?.length || body.length || 0;
        booksFetched.add(count);
      } catch {
        // Ignore parse errors
      }
    } else {
      requestsFailed.add(1);
    }
  });
}

function testHealthCheck() {
  group('GET /health', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/health`);
    const duration = Date.now() - startTime;

    healthCheckDuration.add(duration);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 100ms': (r) => r.timings.duration < 100,
      'status is UP': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data?.status === 'UP' || body.status === 'UP';
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      requestsFailed.add(1);
    }
  });
}

function testGetSingleBook(headers) {
  group('GET /api/v1/books/:id', () => {
    // Test with book ID 1 (assuming it exists)
    const res = http.get(`${API_V1}/books/1`, { headers });

    const success = check(res, {
      'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
      requestsFailed.add(1);
    }
  });
}

function testMetrics() {
  group('GET /metrics', () => {
    const res = http.get(`${BASE_URL}/metrics`);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.duration < 200,
      'contains prometheus metrics': (r) => {
        return r.body.includes('http_requests_total') ||
               r.body.includes('process_') ||
               r.body.includes('nodejs_');
      },
    });

    if (!success) {
      requestsFailed.add(1);
    }
  });
}

function testSearchBooks(headers) {
  group('GET /api/v1/books (search)', () => {
    const searchTerms = ['javascript', 'node', 'programming', 'web', 'api'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const res = http.get(`${API_V1}/books?search=${term}`, { headers });

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
      requestsFailed.add(1);
    }
  });
}

function testAuthEndpoints() {
  group('Auth Endpoints', () => {
    // Just try to access a protected endpoint to generate some auth traffic
    const res = http.get(`${API_V1}/users/profile`, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'status is 401 or 200': (r) => r.status === 401 || r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
  });
}

// =============================================================================
// Teardown Function - Runs once after the test
// =============================================================================

export function teardown(data) {
  console.log('Load test completed!');
  console.log('Check the results summary above for performance metrics.');
}

// =============================================================================
// Handle Summary - Custom summary output
// =============================================================================

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    duration: data.state.testRunDurationMs,
    vus: {
      min: data.metrics.vus?.values?.min || 0,
      max: data.metrics.vus?.values?.max || 0,
    },
    requests: {
      total: data.metrics.http_reqs?.values?.count || 0,
      rate: data.metrics.http_reqs?.values?.rate || 0,
      failed: data.metrics.http_req_failed?.values?.rate || 0,
    },
    latency: {
      avg: data.metrics.http_req_duration?.values?.avg || 0,
      min: data.metrics.http_req_duration?.values?.min || 0,
      max: data.metrics.http_req_duration?.values?.max || 0,
      p50: data.metrics.http_req_duration?.values?.['p(50)'] || 0,
      p90: data.metrics.http_req_duration?.values?.['p(90)'] || 0,
      p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
      p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
    },
  };

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load-test-results.json': JSON.stringify(summary, null, 2),
  };
}

// Helper function for text summary (built into k6)
function textSummary(data, options) {
  // k6 provides a built-in text summary, this is just a wrapper
  const metrics = data.metrics;
  let output = '\n================ LOAD TEST RESULTS ================\n\n';

  output += `Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n`;
  output += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Request Rate: ${(metrics.http_reqs?.values?.rate || 0).toFixed(2)} req/s\n`;
  output += `Failed Requests: ${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;

  output += '---- Response Times ----\n';
  output += `  Average: ${(metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms\n`;
  output += `  Min: ${(metrics.http_req_duration?.values?.min || 0).toFixed(2)}ms\n`;
  output += `  Max: ${(metrics.http_req_duration?.values?.max || 0).toFixed(2)}ms\n`;
  output += `  P50: ${(metrics.http_req_duration?.values?.['p(50)'] || 0).toFixed(2)}ms\n`;
  output += `  P95: ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  output += `  P99: ${(metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  output += '====================================================\n';

  return output;
}
