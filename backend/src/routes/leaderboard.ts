/**
 * Leaderboard Routes
 */

import { Router, Request, Response } from 'express';
import { attemptService } from '../services/attempt-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/leaderboard?mode=daily&date=YYYY-MM-DD&puzzleId=...
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { mode, date, puzzleId, limit } = req.query;
    
    let targetPuzzleId = puzzleId as string;

    // If date provided for daily mode, find that puzzle
    if (mode === 'daily' && date) {
      const puzzle = await prisma.puzzle.findFirst({
        where: {
          mode: 'daily',
          date: new Date(date as string)
        }
      });

      if (!puzzle) {
        return res.status(404).json({ error: 'No puzzle found for that date' });
      }

      targetPuzzleId = puzzle.id;
    }

    if (!targetPuzzleId) {
      return res.status(400).json({ error: 'puzzleId or date is required' });
    }

    const leaderboard = await attemptService.getLeaderboard(
      targetPuzzleId,
      parseInt(limit as string) || 10
    );

    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;

