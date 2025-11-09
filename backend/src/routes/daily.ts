/**
 * Daily Puzzle Routes
 */

import { Router, Request, Response } from 'express';
import { dailyPuzzleService } from '../services/daily-puzzle';

const router = Router();

/**
 * GET /api/daily
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId, timezone } = req.query;
    
    const puzzle = await dailyPuzzleService.getTodaysPuzzle(timezone as string || 'UTC');
    const streakInfo = await dailyPuzzleService.getStreakInfo(
      userId as string | null || null,
      deviceId as string | null || null
    );

    res.json({
      puzzle,
      streak: streakInfo
    });
  } catch (error) {
    console.error('Error getting daily puzzle:', error);
    res.status(500).json({ error: 'Failed to get daily puzzle' });
  }
});

export default router;

