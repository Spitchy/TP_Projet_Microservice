const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const seedDatabase = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Metrics Endpoint (Prometheus)
app.get('/metrics', (req, res) => {
  // TODO: Implement Prometheus metrics collection
  res.status(200).json({
    message: 'Metrics endpoint',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/books', bookRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use(errorMiddleware);

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');

    // Sync models with database (apply necessary alterations)
    await sequelize.sync({ alter: true });
    console.log('✓ Models synced with database');

    // Seed database with initial data
    await seedDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`\n✨ Library Management Microservice is ready!\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
