const request = require('supertest');

// Mock sequelize before requiring app
jest.mock('../config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  define: jest.fn().mockReturnValue({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  }),
}));

// Mock the seed function
jest.mock('../utils/seed', () => jest.fn().mockResolvedValue(true));

// Mock the logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock Livre model
jest.mock('../models/Livre', () => ({
  findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

// Mock User model
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

// Set test environment
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('Health Check Endpoint', () => {
  it('should return status UP with structured response', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('message', 'Service is healthy');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Metrics Endpoint', () => {
  it('should return metrics with structured response', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('memoryUsage');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('404 Handler', () => {
  it('should return 404 with structured response for undefined route', async () => {
    const response = await request(app)
      .get('/undefined-route')
      .expect(404);

    expect(response.body).toHaveProperty('status', 404);
    expect(response.body).toHaveProperty('message', 'Route not found');
    expect(response.body).toHaveProperty('data', null);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('path', '/undefined-route');
  });
});

describe('API v1 Routes', () => {
  describe('GET /api/v1/books', () => {
    it('should return paginated books list', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('pageSize');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should accept pagination query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/books?page=1&size=5&sort=titre&order=asc')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/v1/books (protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/books')
        .send({ titre: 'Test', auteur: 'Author', isbn: '1234567890' })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/v1/books/:id (protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/books/1')
        .send({ titre: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('DELETE /api/v1/books/:id (protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/books/1')
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('POST /api/v1/books/:id/borrow (protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/borrow')
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('POST /api/v1/books/:id/return (protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/return')
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });
});

describe('Legacy API Routes (backward compatibility)', () => {
  it('should support /api/books endpoint', async () => {
    const response = await request(app)
      .get('/api/books')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
