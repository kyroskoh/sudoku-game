/**
 * Device Routes
 * Handle device registration and displayName updates
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /api/device
 * Register or update device
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { deviceId, displayName } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Upsert device
    const device = await prisma.device.upsert({
      where: { id: deviceId },
      update: { displayName },
      create: { id: deviceId, displayName }
    });

    res.json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * PATCH /api/device/:id
 * Update device displayName
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName } = req.body;

    const device = await prisma.device.update({
      where: { id },
      data: { displayName }
    });

    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

export default router;

