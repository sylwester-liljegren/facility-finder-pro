// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { publicApiRouter } from './routes/public-api';
import { adminApiRouter } from './routes/admin-api';
import { geocodeRouter } from './routes/geocode';
import { authRouter } from './routes/auth';

// Debug: Log database config
console.log('=== Database Config ===');
console.log('DB_HOST:', process.env.DB_HOST || '(not set)');
console.log('DB_SSL:', process.env.DB_SSL || '(not set)');
console.log('=======================');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/public', publicApiRouter);
app.use('/api/admin', adminApiRouter);
app.use('/api/geocode', geocodeRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Facility API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
