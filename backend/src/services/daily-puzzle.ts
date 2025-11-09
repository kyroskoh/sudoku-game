/**
 * Daily Puzzle Service
 * Manages daily puzzle generation and retrieval
 */

import { PrismaClient } from '@prisma/client';
import { sudokuGenerator, Difficulty } from './sudoku-generator';

const prisma = new PrismaClient();

export class DailyPuzzleService {
  /**
   * Get or create today's daily puzzle
   */
  async getTodaysPuzzle(timezone: string = 'UTC'): Promise<any> {
    const today = this.getTodayDate(timezone);
    
    // Try to find existing puzzle for today
    let puzzle = await prisma.puzzle.findFirst({
      where: {
        mode: 'daily',
        date: today
      }
    });

    // If doesn't exist, generate it
    if (!puzzle) {
      puzzle = await this.generateDailyPuzzle(today);
    }

    // TypeScript guard: puzzle is guaranteed to exist at this point
    if (!puzzle) {
      throw new Error('Failed to get or generate daily puzzle');
    }

    return {
      id: puzzle.id,
      givens: JSON.parse(puzzle.givens),
      difficulty: puzzle.difficulty,
      date: puzzle.date,
      mode: puzzle.mode
    };
  }

  /**
   * Generate daily puzzle for a specific date
   */
  private async generateDailyPuzzle(date: Date): Promise<any> {
    // Use date as seed for reproducibility
    const seed = this.getDateSeed(date);
    
    // Rotate difficulty through the week
    const difficulty = this.getDifficultyForDate(date);
    
    const puzzleData = sudokuGenerator.generatePuzzle(difficulty, seed);

    const puzzle = await prisma.puzzle.create({
      data: {
        mode: 'daily',
        difficulty,
        date,
        seed,
        givens: JSON.stringify(puzzleData.givens),
        solution: JSON.stringify(puzzleData.solution)
      }
    });

    return puzzle;
  }

  /**
   * Get date seed for reproducibility
   */
  private getDateSeed(date: Date): string {
    return `daily-${date.toISOString().split('T')[0]}`;
  }

  /**
   * Get difficulty based on day of week
   */
  private getDifficultyForDate(date: Date): Difficulty {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    const difficultyMap: { [key: number]: Difficulty } = {
      0: 'easy',    // Sunday
      1: 'easy',    // Monday
      2: 'medium',  // Tuesday
      3: 'medium',  // Wednesday
      4: 'hard',    // Thursday
      5: 'hard',    // Friday
      6: 'expert'   // Saturday
    };

    return difficultyMap[dayOfWeek];
  }

  /**
   * Get today's date at 00:00:00
   */
  private getTodayDate(timezone: string): Date {
    const now = new Date();
    const today = new Date(now.toLocaleDateString('en-US', { timeZone: timezone }));
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Get user's streak information
   */
  async getStreakInfo(userId: string | null, deviceId: string | null): Promise<{ currentStreak: number; lastPlayedDate: Date | null }> {
    if (!userId && !deviceId) {
      return { currentStreak: 0, lastPlayedDate: null };
    }

    // Get all completed daily attempts for this user/device, ordered by date
    const attempts = await prisma.attempt.findMany({
      where: {
        mode: 'daily',
        result: 'completed',
        ...(userId ? { userId } : { deviceId })
      },
      include: {
        puzzle: true
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    if (attempts.length === 0) {
      return { currentStreak: 0, lastPlayedDate: null };
    }

    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const completedDates = new Set(
      attempts
        .filter(a => a.puzzle.date)
        .map(a => a.puzzle.date!.toISOString().split('T')[0])
    );

    // Check backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0 && dateStr === new Date().toISOString().split('T')[0]) {
        // Today not completed yet, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      lastPlayedDate: attempts[0].finishedAt
    };
  }
}

export const dailyPuzzleService = new DailyPuzzleService();

