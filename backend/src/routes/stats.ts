/**
 * Stats Routes
 */

import { Router, Request, Response } from 'express';
import { attemptService } from '../services/attempt-service';

const router = Router();

/**
 * GET /api/stats?userId=...&deviceId=...
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.query;

    if (!userId && !deviceId) {
      return res.status(400).json({ error: 'userId or deviceId is required' });
    }

    const stats = await attemptService.getStats(
      userId as string | undefined,
      deviceId as string | undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;

