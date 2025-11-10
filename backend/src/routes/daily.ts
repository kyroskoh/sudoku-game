/**
 * Daily Puzzle Routes
 * Daily puzzles reset at 12:00 AM Singapore Time (SGT/UTC+8)
 */

import { Router, Request, Response } from 'express';
import { dailyPuzzleService } from '../services/daily-puzzle';

const router = Router();

/**
 * GET /api/daily?difficulty=easy
 * Get today's daily puzzle for a specific difficulty (resets at 12:00 AM SGT)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId, difficulty } = req.query;
    
    // Default to medium if no difficulty specified
    const selectedDifficulty = (difficulty as string) || 'medium';
    
    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'extreme'];
    if (!validDifficulties.includes(selectedDifficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }
    
    const puzzle = await dailyPuzzleService.getTodaysPuzzle(
      selectedDifficulty as any,
      userId as string,
      deviceId as string
    );
    const streak = await dailyPuzzleService.getStreakInfo(
      userId as string || null,
      deviceId as string || null
    );
    const isCompleted = await dailyPuzzleService.hasCompletedToday(
      userId as string | undefined,
      deviceId as string | undefined,
      selectedDifficulty as any
    );

    res.json({ puzzle, streak, isCompleted });
  } catch (error) {
    console.error('Error getting daily puzzle:', error);
    res.status(500).json({ error: 'Failed to get daily puzzle' });
  }
});

/**
 * GET /api/daily/info
 * Get info about daily puzzle timing (SGT timezone)
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    const info = dailyPuzzleService.getSGTInfo();
    res.json({
      timezone: 'Asia/Singapore (SGT)',
      utcOffset: '+08:00',
      ...info
    });
  } catch (error) {
    console.error('Error getting daily info:', error);
    res.status(500).json({ error: 'Failed to get daily info' });
  }
});

export default router;

