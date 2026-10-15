
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ─────────────────────────────────────

const allowedOrigins = [
  'https://zippy-douhua-b5fd81.netlify.app',
  'http://localhost:5173',
  process.env.CLIENT_URL
]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = origin
      ? origin.replace(/\/$/, '')
      : undefined;

    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// CORS middleware must run before routes
app.use(cors(corsOptions));

// ─── Body Parsers ────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── API Routes ─────────────────────────────────────────────

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/assessment', require('./routes/assessmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ─── Health Check ───────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PlacePro Cloud API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// ─── Global Error Handler ───────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS blocked this origin.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

// ─── Start Server ───────────────────────────────────────────

const startServer = async () => {
  try {
    await testConnection();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`PlacePro Cloud API running on port ${PORT}`);
      console.log(`API Health: /api/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Allowed frontend origins:', allowedOrigins);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
