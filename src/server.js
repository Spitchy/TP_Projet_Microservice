const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const seedDatabase = require('./utils/seed');
const logger = require('./utils/logger');
const { successResponse } = require('./utils/responseHelper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Structured JSON logging for HTTP requests in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
} else {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  return successResponse(res, {
    data: { status: 'UP', uptime: process.uptime() },
    message: 'Service is healthy',
  });
});

// Metrics Endpoint (Prometheus)
app.get('/metrics', (req, res) => {
  return successResponse(res, {
    data: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
    message: 'Metrics retrieved successfully',
  });
});

// API Routes v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/books', bookRoutes);

// Legacy routes (for backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/books', bookRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
    data: null,
    timestamp: new Date().toISOString(),
    path: req.url,
  });
});

// Global Error Handler
app.use(errorMiddleware);

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync models with database (apply necessary alterations)
    await sequelize.sync({ alter: true });
    logger.info('Models synced with database');

    // Seed database with initial data
    await seedDatabase();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`, { port: PORT });
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`📚 API v1: http://localhost:${PORT}/api/v1/books`);
      console.log(`\n✨ Library Management Microservice is ready!\n`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
