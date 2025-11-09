/**
 * Main Express Application
 * Sudoku Mastery Backend API
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import puzzlesRouter from './routes/puzzles';
import attemptsRouter from './routes/attempts';
import dailyRouter from './routes/daily';
import leaderboardRouter from './routes/leaderboard';
import syncRouter from './routes/sync';
import statsRouter from './routes/stats';
import deviceRouter from './routes/device';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/puzzles', puzzlesRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/sync', syncRouter);
app.use('/api/stats', statsRouter);
app.use('/api/device', deviceRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Sudoku Mastery API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      puzzles: '/api/puzzles',
      attempts: '/api/attempts',
      daily: '/api/daily',
      leaderboard: '/api/leaderboard',
      sync: '/api/sync',
      stats: '/api/stats'
    }
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sudoku Mastery API server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

