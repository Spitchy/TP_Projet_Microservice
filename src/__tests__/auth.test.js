/* Auth Controller Tests */
const { register } = require('../../controllers/userController');

describe('User Registration', () => {
  it('should validate required fields', async () => {
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
  });

  it('should validate password match', async () => {
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
  });

  it('should validate minimum password length', async () => {
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
  });
});
