/**
 * Global Error Handling Middleware
 * Catches all errors and sends a standardized response
 */
const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status,
    message,
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

module.exports = errorMiddleware;
