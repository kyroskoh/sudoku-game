/**
 * Sync Routes
 */

import { Router, Request, Response } from 'express';
import { attemptService } from '../services/attempt-service';

const router = Router();

/**
 * POST /api/sync
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { attempts, userId, deviceId } = req.body;

    if (!attempts || !Array.isArray(attempts)) {
      return res.status(400).json({ error: 'Attempts array is required' });
    }

    const syncedAttempts = await attemptService.syncAttempts(
      attempts,
      userId,
      deviceId
    );

    res.json({
      success: true,
      attempts: syncedAttempts
    });
  } catch (error) {
    console.error('Error syncing attempts:', error);
    res.status(500).json({ error: 'Failed to sync attempts' });
  }
});

export default router;

