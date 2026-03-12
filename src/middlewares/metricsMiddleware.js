const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// =============================================================================
// HTTP Metrics
// =============================================================================

// Counter: Total HTTP requests
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
});

// Histogram: HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// =============================================================================
// Business Metrics
// =============================================================================

// Counter: Total books borrowed
const booksBorrowedTotal = new client.Counter({
  name: 'books_borrowed_total',
  help: 'Total number of books borrowed',
  registers: [register],
});

// Counter: Total books returned
const booksReturnedTotal = new client.Counter({
  name: 'books_returned_total',
  help: 'Total number of books returned',
  registers: [register],
});

// Gauge: Currently borrowed books
const booksCurrentlyBorrowed = new client.Gauge({
  name: 'books_currently_borrowed',
  help: 'Number of books currently borrowed',
  registers: [register],
});

// =============================================================================
// Database Metrics
// =============================================================================

// Histogram: Database query duration
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Counter: Database query errors
const dbQueryErrors = new client.Counter({
  name: 'db_query_errors_total',
  help: 'Total number of database query errors',
  labelNames: ['operation', 'table'],
  registers: [register],
});

// Initialize error counters with 0 so Grafana shows "0" instead of "No data"
['SELECT', 'INSERT', 'UPDATE', 'DELETE'].forEach((op) => {
  dbQueryErrors.inc({ operation: op, table: 'livres' }, 0);
});

// =============================================================================
// Middleware Function
// =============================================================================

/**
 * Express middleware to collect HTTP metrics
 */
const metricsMiddleware = (req, res, next) => {
  // Skip metrics endpoint to avoid recursive metrics
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = Date.now();

  // Normalize endpoint path (remove IDs for better grouping)
  const normalizeEndpoint = (path) => {
    return path
      .replace(/\/[0-9a-fA-F-]{36}/g, '/:id') // UUID
      .replace(/\/\d+/g, '/:id'); // Numeric ID
  };

  // On response finish, record metrics
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const endpoint = normalizeEndpoint(req.path);
    const method = req.method;
    const status = res.statusCode.toString();

    // Increment request counter
    httpRequestsTotal.inc({
      method,
      endpoint,
      status,
    });

    // Record request duration
    httpRequestDuration.observe(
      {
        method,
        endpoint,
      },
      duration
    );
  });

  next();
};

// =============================================================================
// Helper Functions for Business Metrics
// =============================================================================

/**
 * Increment books borrowed counter
 */
const recordBookBorrowed = () => {
  booksBorrowedTotal.inc();
  booksCurrentlyBorrowed.inc();
};

/**
 * Increment books returned counter
 */
const recordBookReturned = () => {
  booksReturnedTotal.inc();
  booksCurrentlyBorrowed.dec();
};

/**
 * Set current borrowed books count
 * @param {number} count - Current count of borrowed books
 */
const setCurrentlyBorrowedBooks = (count) => {
  booksCurrentlyBorrowed.set(count);
};

// =============================================================================
// Helper Functions for Database Metrics
// =============================================================================

/**
 * Record database query duration
 * @param {string} operation - Type of operation (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Table name
 * @param {number} durationMs - Duration in milliseconds
 */
const recordDbQueryDuration = (operation, table, durationMs) => {
  dbQueryDuration.observe(
    {
      operation: operation.toUpperCase(),
      table,
    },
    durationMs / 1000 // Convert to seconds
  );
};

/**
 * Record database query error
 * @param {string} operation - Type of operation
 * @param {string} table - Table name
 */
const recordDbQueryError = (operation, table) => {
  dbQueryErrors.inc({
    operation: operation.toUpperCase(),
    table,
  });
};

/**
 * Wrap a database operation to automatically record metrics
 * @param {string} operation - Type of operation
 * @param {string} table - Table name
 * @param {Function} queryFn - Async function that performs the query
 * @returns {Promise} - Result of the query
 */
const withDbMetrics = async (operation, table, queryFn) => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    recordDbQueryDuration(operation, table, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordDbQueryDuration(operation, table, duration);
    recordDbQueryError(operation, table);
    throw error;
  }
};

// =============================================================================
// Exports
// =============================================================================

module.exports = {
  register,
  metricsMiddleware,
  // HTTP metrics
  httpRequestsTotal,
  httpRequestDuration,
  // Business metrics
  booksBorrowedTotal,
  booksReturnedTotal,
  booksCurrentlyBorrowed,
  recordBookBorrowed,
  recordBookReturned,
  setCurrentlyBorrowedBooks,
  // Database metrics
  dbQueryDuration,
  dbQueryErrors,
  recordDbQueryDuration,
  recordDbQueryError,
  withDbMetrics,
};
