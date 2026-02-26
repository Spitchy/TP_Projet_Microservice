/**
 * Global Error Handling Middleware
 * Catches all errors and sends structured JSON responses
 */
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with structured logging
  if (status >= 500) {
    logger.error('Server error', {
      status,
      message,
      path: req.url,
      method: req.method,
      stack: err.stack,
    });
  } else {
    logger.warn('Client error', {
      status,
      message,
      path: req.url,
      method: req.method,
    });
  }

  res.status(status).json({
    status,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

module.exports = errorMiddleware;
