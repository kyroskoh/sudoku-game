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
      data
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
              }
            });
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
            }
          });
        }

        results.push(attempt);
      } catch (error) {
        console.error('Error syncing attempt:', error);
      }
    }

    return results;
  }

  /**
   * Update leaderboard for a completed attempt
   */
  private async updateLeaderboard(attempt: any): Promise<void> {
    // Only add to leaderboard for daily and challenge modes
    if (attempt.mode !== 'daily' && attempt.mode !== 'challenge') {
      return;
    }

    await prisma.leaderboard.create({
      data: {
        puzzleId: attempt.puzzleId,
        userId: attempt.userId,
        deviceId: attempt.deviceId,
        timeMs: attempt.timeMs
      }
    });
  }

  /**
   * Get leaderboard for a puzzle
   */
  async getLeaderboard(puzzleId: string, limit: number = 10): Promise<any[]> {
    return prisma.leaderboard.findMany({
      where: { puzzleId },
      orderBy: {
        timeMs: 'asc'
      },
      take: limit
    });
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

