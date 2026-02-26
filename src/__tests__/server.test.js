const request = require('supertest');
const app = require('../src/server');

describe('Health Check Endpoint', () => {
  it('should return status UP', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'UP' });
  });
});

describe('Metrics Endpoint', () => {
  it('should return metrics structure', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('404 Handler', () => {
  it('should return 404 for undefined route', async () => {
    const response = await request(app)
      .get('/undefined-route')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});
