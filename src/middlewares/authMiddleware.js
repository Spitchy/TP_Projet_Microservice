const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Verifies the JWT token in the Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', { path: req.url, method: req.method });
      return errorResponse(res, {
        message: 'Authentication required. No token provided.',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, {
        message: 'Authentication required. No token provided.',
        statusCode: 401,
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    
    logger.info('User authenticated', { userId: decoded.id, role: decoded.role, path: req.url });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', { path: req.url });
      return errorResponse(res, {
        message: 'Token has expired. Please login again.',
        statusCode: 401,
      });
    }
    
    logger.warn('Invalid token', { path: req.url, error: error.message });
    return errorResponse(res, {
      message: 'Invalid token. Authentication failed.',
      statusCode: 401,
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 * @param  {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: roles,
        path: req.url 
      });
      return errorResponse(res, {
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
        statusCode: 403,
      });
    }

    next();
  };
};

/**
 * Optional Auth Middleware
 * Attaches user to request if token exists, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Token invalid but optional, so continue without user
    next();
  }
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
module.exports.optionalAuth = optionalAuth;
