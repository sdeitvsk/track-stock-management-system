
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { requestLogger } = require('./middlewares/loggingMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const issueRoutes = require('./routes/issueRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const indentRequestRoutes = require('./routes/indentRequestRoutes');

// Import database
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  // origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Inventory Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/indent-requests', indentRequestRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
