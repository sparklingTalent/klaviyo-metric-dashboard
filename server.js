require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { dbOperations } = require('./database');
const KlaviyoService = require('./klaviyoService');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration using Express CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins - you can restrict this in production if needed
    // To restrict to specific domains, uncomment and modify:
    /*
    const allowedOrigins = [
      'https://klaviyo-metric-dashboard.vercel.app',
      'https://klaviyo-metric-dashboard-production.vercel.app',
      /\.vercel\.app$/,
      /\.vercel\.dev$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') return origin === pattern;
      if (pattern instanceof RegExp) return pattern.test(origin);
      return false;
    });
    
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    */
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false, // Pass the CORS preflight response to the next handler
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS middleware - this handles both preflight (OPTIONS) and actual requests
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React app only if build directory exists
const buildPath = path.join(__dirname, 'client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// ==================== HEALTH CHECK ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== ADMIN ROUTES ====================

// Add a new client (admin only - in production, add admin authentication)
app.post('/api/admin/clients', async (req, res) => {
  try {
    const { name, email, password, klaviyoPrivateKey } = req.body;

    // Validation
    if (!name || !email || !password || !klaviyoPrivateKey) {
      return res.status(400).json({ 
        error: 'All fields are required: name, email, password, klaviyoPrivateKey' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Add client to database
    const client = await dbOperations.addClient(name, email, hashedPassword, klaviyoPrivateKey);

    res.status(201).json({ 
      message: 'Client added successfully',
      client: { id: client.id, name: client.name, email: client.email }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error adding client:', error);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

// Get all clients (admin only)
app.get('/api/admin/clients', async (req, res) => {
  try {
    const clients = await dbOperations.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// Client login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get client from database
    const client = await dbOperations.getClientByEmail(email);
    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, client.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(client.id);

    res.json({
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== CLIENT DASHBOARD ROUTES ====================

// Get client's Klaviyo dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, async (req, res) => {
  try {
    const clientId = req.clientId;

    // Get client from database
    const client = await dbOperations.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Initialize Klaviyo service with client's private key
    const klaviyoService = new KlaviyoService(client.klaviyo_private_key);

    // Fetch dashboard metrics
    const metrics = await klaviyoService.getDashboardMetrics();

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Klaviyo metrics',
      message: error.message 
    });
  }
});

// Get client profile
app.get('/api/dashboard/profile', authenticateToken, async (req, res) => {
  try {
    const clientId = req.clientId;
    const client = await dbOperations.getClientById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      id: client.id,
      name: client.name,
      email: client.email
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Serve React app (only if build exists, otherwise return API info)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // In development, React dev server handles frontend
    res.status(404).json({ 
      message: 'API server running. Frontend not built. Run "cd client && npm start" for development.',
      api: {
        admin: '/api/admin/clients',
        auth: '/api/auth/login',
        dashboard: '/api/dashboard/metrics'
      }
    });
  }
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
// Listen on 0.0.0.0 to accept connections from all network interfaces (required for Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for all origins`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

