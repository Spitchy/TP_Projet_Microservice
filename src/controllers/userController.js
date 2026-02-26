const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { nom, email, password, confirmPassword } = req.body;

    // Validation
    if (!nom || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: nom, email, password',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      return errorResponse(res, {
        message: 'Email already registered',
        statusCode: 409,
      });
    }

    // Create new user
    const user = await User.create({
      nom,
      email,
      password,
      role: 'user',
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return successResponse(res, {
      data: {
        token,
        user: {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
        },
      },
      message: 'User registered successfully',
      statusCode: 201,
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, {
        message: 'Email and password are required',
        statusCode: 400,
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return errorResponse(res, {
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { email });
      return errorResponse(res, {
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return successResponse(res, {
      data: {
        token,
        user: {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, {
        message: 'User not found',
        statusCode: 404,
      });
    }

    return successResponse(res, {
      data: { user },
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * GET /api/v1/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, {
        message: 'Access denied. Admin role required',
        statusCode: 403,
      });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, {
      data: { users, count: users.length },
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, {
        message: 'User not found',
        statusCode: 404,
      });
    }

    return successResponse(res, {
      data: { user },
      message: 'User retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin can update any user, user can update self)
 * PUT /api/v1/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, email, role } = req.body;

    // Check authorization
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return errorResponse(res, {
        message: 'Access denied. Can only update your own profile',
        statusCode: 403,
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, {
        message: 'User not found',
        statusCode: 404,
      });
    }

    // Only admin can change role
    if (role && req.user.role === 'admin') {
      user.role = role;
    }

    if (nom) user.nom = nom;
    if (email) user.email = email;

    await user.save();

    logger.info('User updated', { userId: id, updatedBy: req.user.id });

    return successResponse(res, {
      data: {
        user: {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
        },
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, {
        message: 'Access denied. Admin role required',
        statusCode: 403,
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, {
        message: 'User not found',
        statusCode: 404,
      });
    }

    await user.destroy();

    logger.info('User deleted', { userId: id, deletedBy: req.user.id });

    return successResponse(res, {
      data: null,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
