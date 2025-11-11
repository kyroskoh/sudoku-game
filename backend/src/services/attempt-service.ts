/**
 * Attempt Service
 * Handles game attempt tracking and stats
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAttemptData {
  puzzleId: string;
  userId?: string;
  deviceId?: string;
  mode: string;
  difficulty: string;
  startedAt: Date;
}

export interface UpdateAttemptData {
  finishedAt?: Date;
  timeMs?: number;
  mistakes?: number;
  hintsUsed?: number;
  result?: 'in_progress' | 'completed' | 'failed';
}

export class AttemptService {
  /**
   * Create a new attempt
   */
  async createAttempt(data: CreateAttemptData): Promise<any> {
    const attempt = await prisma.attempt.create({
      data: {
        puzzleId: data.puzzleId,
        userId: data.userId,
        deviceId: data.deviceId,
        mode: data.mode,
        difficulty: data.difficulty,
        startedAt: data.startedAt
      }
    });

    return attempt;
  }

  /**
   * Update an existing attempt
   */
  async updateAttempt(id: string, data: UpdateAttemptData): Promise<any> {
    const attempt = await prisma.attempt.update({
      where: { id },
      data,
      include: {
        puzzle: true // Include puzzle for leaderboard update
      }
    });

    // If completed, update leaderboard
    if (data.result === 'completed' && data.timeMs) {
      await this.updateLeaderboard(attempt);
    }

    return attempt;
  }

  /**
   * Get attempt by ID
   */
  async getAttemptById(id: string): Promise<any> {
    return prisma.attempt.findUnique({
      where: { id },
      include: {
        puzzle: true
      }
    });
  }

  /**
   * Get attempts for a user/device
   */
  async getAttempts(userId?: string, deviceId?: string): Promise<any[]> {
    return prisma.attempt.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(deviceId ? { deviceId } : {})
      },
      include: {
        puzzle: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  /**
   * Sync attempts from client
   */
  async syncAttempts(attempts: any[], userId?: string, deviceId?: string): Promise<any[]> {
    const results = [];

    for (const attemptData of attempts) {
      try {
        // Check if attempt already exists
        let attempt = await prisma.attempt.findUnique({
          where: { id: attemptData.id }
        });

        if (attempt) {
          // Update if client version is newer
          const clientUpdatedAt = new Date(attemptData.updatedAt);
          if (clientUpdatedAt > attempt.updatedAt) {
            attempt = await prisma.attempt.update({
              where: { id: attemptData.id },
              data: {
                finishedAt: attemptData.finishedAt ? new Date(attemptData.finishedAt) : null,
                timeMs: attemptData.timeMs,
                mistakes: attemptData.mistakes,
                hintsUsed: attemptData.hintsUsed,
                result: attemptData.result
              },
              include: {
                puzzle: true // Include puzzle for leaderboard update
              }
            });
            
            // Update leaderboard if completed
            if (attemptData.result === 'completed' && attemptData.timeMs) {
              await this.updateLeaderboard(attempt);
            }
          }
        } else {
          // Create new attempt
          attempt = await prisma.attempt.create({
            data: {
              id: attemptData.id,
              puzzleId: attemptData.puzzleId,
              userId: userId || attemptData.userId,
              deviceId: deviceId || attemptData.deviceId,
              mode: attemptData.mode,
              difficulty: attemptData.difficulty,
              startedAt: new Date(attemptData.startedAt),
              finishedAt: attemptData.finishedAt ? new Date(attemptData.finishedAt) : null,
              timeMs: attemptData.timeMs,
              mistakes: attemptData.mistakes || 0,
              hintsUsed: attemptData.hintsUsed || 0,
              result: attemptData.result || 'in_progress'
            },
            include: {
              puzzle: true // Include puzzle for leaderboard update
            }
          });
          
          // Update leaderboard if completed
          if (attemptData.result === 'completed' && attemptData.timeMs) {
            await this.updateLeaderboard(attempt);
          }
        }

        results.push(attempt);
      } catch (error) {
        console.error('[Sync] Error syncing attempt:', error);
        // Continue with other attempts even if one fails
      }
    }

    console.log(`[Sync] Synced ${results.length} of ${attempts.length} attempts`);
    return results;
  }

  /**
   * Update leaderboard for a completed attempt
   */
  private async updateLeaderboard(attempt: any): Promise<void> {
    // Track ALL modes now (casual, daily, challenge)
    // Only skip if attempt wasn't completed or has no time
    if (!attempt.timeMs || attempt.result !== 'completed') {
      console.log('[Leaderboard] Skipping - attempt not completed or no time:', {
        timeMs: attempt.timeMs,
        result: attempt.result
      });
      return;
    }

    try {
      // Check if leaderboard entry already exists for this attempt
      const existing = await prisma.leaderboard.findFirst({
        where: {
          puzzleId: attempt.puzzleId,
          ...(attempt.deviceId ? { deviceId: attempt.deviceId } : {}),
          ...(attempt.userId ? { userId: attempt.userId } : {})
        }
      });

      if (existing) {
        // Update existing entry if this time is better (faster)
        if (attempt.timeMs < existing.timeMs) {
          console.log('[Leaderboard] Updating existing entry with better time:', {
            puzzleId: attempt.puzzleId,
            oldTime: existing.timeMs,
            newTime: attempt.timeMs
          });
          
          // Get displayName from device or user
          let displayName: string | null = null;
          if (attempt.deviceId) {
            const device = await prisma.device.findUnique({
              where: { id: attempt.deviceId }
            }) as any;
            displayName = device?.displayName || null;
          } else if (attempt.userId) {
            const user = await prisma.user.findUnique({
              where: { id: attempt.userId }
            }) as any;
            displayName = user?.displayName || null;
          }

          await prisma.leaderboard.update({
            where: { id: existing.id },
            data: {
              displayName: displayName || null,
              timeMs: attempt.timeMs
            } as any
          });
        } else {
          console.log('[Leaderboard] Existing entry has better time, skipping update');
        }
        return;
      }

      // Get displayName from device or user
      let displayName: string | null = null;
      if (attempt.deviceId) {
        const device = await prisma.device.findUnique({
          where: { id: attempt.deviceId }
        }) as any;
        displayName = device?.displayName || null;
      } else if (attempt.userId) {
        const user = await prisma.user.findUnique({
          where: { id: attempt.userId }
        }) as any;
        displayName = user?.displayName || null;
      }

      console.log('[Leaderboard] Creating new entry:', {
        puzzleId: attempt.puzzleId,
        deviceId: attempt.deviceId,
        userId: attempt.userId,
        displayName,
        timeMs: attempt.timeMs
      });

      await prisma.leaderboard.create({
        data: {
          puzzleId: attempt.puzzleId,
          userId: attempt.userId,
          deviceId: attempt.deviceId,
          displayName: displayName || null,
          timeMs: attempt.timeMs
        } as any
      });

      console.log('[Leaderboard] Entry created successfully');
    } catch (error) {
      console.error('[Leaderboard] Error updating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for a puzzle
   */
  async getLeaderboard(puzzleId: string, limit: number = 10): Promise<any[]> {
    const results = await prisma.leaderboard.findMany({
      where: { puzzleId },
      orderBy: {
        timeMs: 'asc' // Faster times first (ascending = smaller numbers first)
      },
      take: limit
    }) as any[];
    
    // Ensure displayName is included in response
    return results.map(entry => ({
      id: entry.id,
      puzzleId: entry.puzzleId,
      userId: entry.userId,
      deviceId: entry.deviceId,
      displayName: entry.displayName || null,
      timeMs: entry.timeMs,
      createdAt: entry.createdAt
    }));
  }

  /**
   * Get stats for a user/device
   */
  async getStats(userId?: string, deviceId?: string): Promise<any> {
    const attempts = await prisma.attempt.findMany({
      where: {
        result: 'completed',
        ...(userId ? { userId } : {}),
        ...(deviceId ? { deviceId } : {})
      }
    });

    // Calculate stats by mode and difficulty
    const stats: any = {
      totalCompleted: attempts.length,
      byMode: {},
      byDifficulty: {},
      bestTimes: {}
    };

    for (const attempt of attempts) {
      // By mode
      if (!stats.byMode[attempt.mode]) {
        stats.byMode[attempt.mode] = { count: 0, totalTime: 0 };
      }
      stats.byMode[attempt.mode].count++;
      stats.byMode[attempt.mode].totalTime += attempt.timeMs || 0;

      // By difficulty
      if (!stats.byDifficulty[attempt.difficulty]) {
        stats.byDifficulty[attempt.difficulty] = { count: 0, totalTime: 0 };
      }
      stats.byDifficulty[attempt.difficulty].count++;
      stats.byDifficulty[attempt.difficulty].totalTime += attempt.timeMs || 0;

      // Best times
      const key = `${attempt.mode}-${attempt.difficulty}`;
      if (!stats.bestTimes[key] || (attempt.timeMs && attempt.timeMs < stats.bestTimes[key])) {
        stats.bestTimes[key] = attempt.timeMs;
      }
    }

    return stats;
  }
}

export const attemptService = new AttemptService();

