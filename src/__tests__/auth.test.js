/* Auth Controller Tests */

// Mock sequelize before requiring anything that uses it
jest.mock('../config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  define: jest.fn().mockReturnValue({}),
}));

// Mock User model
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const { register } = require('../controllers/userController');

describe('User Registration Validation', () => {
  it('should reject when required fields are missing', async () => {
    const req = {
      body: {
        nom: 'John Doe',
        // email missing
        password: 'password123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('required'),
      })
    );
  });

  it('should reject when passwords do not match', async () => {
    const req = {
      body: {
        nom: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password456', // mismatch
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('match'),
      })
    );
  });

  it('should reject passwords shorter than 6 characters', async () => {
    const req = {
      body: {
        nom: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('6 characters'),
      })
    );
  });
});
