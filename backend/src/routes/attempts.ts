/**
 * Attempt Routes
 */

import { Router, Request, Response } from 'express';
import { attemptService } from '../services/attempt-service';

const router = Router();

/**
 * POST /api/attempts
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { puzzleId, mode, difficulty, startedAt, userId, deviceId } = req.body;

    if (!puzzleId || !mode || !difficulty || !startedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const attempt = await attemptService.createAttempt({
      puzzleId,
      userId,
      deviceId,
      mode,
      difficulty,
      startedAt: new Date(startedAt)
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error creating attempt:', error);
    res.status(500).json({ error: 'Failed to create attempt' });
  }
});

/**
 * PATCH /api/attempts/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.finishedAt) {
      updateData.finishedAt = new Date(updateData.finishedAt);
    }

    const attempt = await attemptService.updateAttempt(id, updateData);
    res.json(attempt);
  } catch (error) {
    console.error('Error updating attempt:', error);
    res.status(500).json({ error: 'Failed to update attempt' });
  }
});

/**
 * GET /api/attempts/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attempt = await attemptService.getAttemptById(id);
    
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Error getting attempt:', error);
    res.status(500).json({ error: 'Failed to get attempt' });
  }
});

/**
 * GET /api/attempts?userId=...&deviceId=...
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.query;
    const attempts = await attemptService.getAttempts(
      userId as string | undefined,
      deviceId as string | undefined
    );
    res.json(attempts);
  } catch (error) {
    console.error('Error getting attempts:', error);
    res.status(500).json({ error: 'Failed to get attempts' });
  }
});

export default router;

