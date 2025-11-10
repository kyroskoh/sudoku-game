/**
 * Daily Puzzle Service
 * Manages daily puzzle generation and retrieval
 * Daily puzzles reset at 12:00 AM Singapore Time (SGT/UTC+8)
 * 
 * Security: Puzzle seeds are salted with PUZZLE_SALT from environment
 * to prevent players from reproducing puzzles and cheating.
 */

import { PrismaClient } from '@prisma/client';
import { sudokuGenerator, Difficulty } from './sudoku-generator';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Singapore Time is UTC+8
const SGT_TIMEZONE = 'Asia/Singapore';
const SGT_OFFSET_HOURS = 8;

// Get puzzle salt from environment (fallback to default for development)
const PUZZLE_SALT = process.env.PUZZLE_SALT || 'default_sudoku_salt_change_in_production';

export class DailyPuzzleService {
  /**
   * Get or create today's daily puzzle for a specific difficulty (based on SGT timezone)
   */
  async getTodaysPuzzle(difficulty: Difficulty, userId?: string, deviceId?: string): Promise<any> {
    const todaySGT = this.getTodayDateSGT();
    const dateKey = this.getDateKey(todaySGT, difficulty);
    
    console.log(`[Daily Puzzle] Requesting ${difficulty} puzzle for SGT date: ${dateKey}`);
    
    // Try to find existing puzzle for today with this difficulty
    let puzzle = await prisma.puzzle.findFirst({
      where: {
        mode: 'daily',
        seed: dateKey // Use seed as unique identifier for the date + difficulty
      }
    });

    // If doesn't exist, generate it
    if (!puzzle) {
      console.log(`[Daily Puzzle] Generating new puzzle for ${dateKey}`);
      try {
        puzzle = await this.generateDailyPuzzle(todaySGT, dateKey, difficulty);
        if (!puzzle) {
          throw new Error('Puzzle generation returned null');
        }
        console.log(`[Daily Puzzle] Successfully generated puzzle ${puzzle.id} for ${dateKey}`);
      } catch (error) {
        console.error(`[Daily Puzzle] ERROR generating puzzle for ${dateKey}:`, error);
        throw error; // Re-throw to be caught by route handler
      }
    } else {
      console.log(`[Daily Puzzle] Found existing puzzle for ${dateKey}`);
    }

    // Ensure puzzle exists (should never be null at this point, but TypeScript needs this)
    if (!puzzle) {
      throw new Error('Failed to get or generate daily puzzle');
    }

    return {
      id: puzzle.id,
      givens: JSON.parse(puzzle.givens),
      difficulty: puzzle.difficulty,
      date: puzzle.date,
      mode: puzzle.mode,
      seed: puzzle.seed
    };
  }

  /**
   * Generate daily puzzle for a specific date and difficulty with deterministic seed
   * The seed is salted with PUZZLE_SALT to prevent players from cheating by reproducing puzzles
   */
  private async generateDailyPuzzle(date: Date, dateKey: string, difficulty: Difficulty): Promise<any> {
    // Create salted seed for actual puzzle generation (not stored in DB)
    const saltedSeed = this.createSaltedSeed(dateKey);
    
    console.log(`[Daily Puzzle] Generating ${difficulty} puzzle with seed: ${dateKey} (salted: ${saltedSeed.substring(0, 20)}...)`);
    
    try {
      // Generate puzzle using salted seed
      const puzzleData = sudokuGenerator.generatePuzzle(difficulty, saltedSeed);
      
      console.log(`[Daily Puzzle] Puzzle generated successfully. Givens count: ${puzzleData.givens.flat().filter(c => c !== 0).length}`);
      console.log(`[Daily Puzzle] Solution validated: ${puzzleData.solution.every(row => row.every(cell => cell >= 1 && cell <= 9))}`);

      // Store with original dateKey (not salted) for consistency and lookup
      const puzzle = await prisma.puzzle.create({
        data: {
          mode: 'daily',
          difficulty,
          date,
          seed: dateKey, // Store unsalted seed for lookup and display
          givens: JSON.stringify(puzzleData.givens),
          solution: JSON.stringify(puzzleData.solution)
        }
      });

      console.log(`[Daily Puzzle] Puzzle saved to database with ID: ${puzzle.id}`);
      return puzzle;
    } catch (error) {
      console.error(`[Daily Puzzle] Failed to generate puzzle for ${dateKey}:`, error);
      console.error(`[Daily Puzzle] Error details:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Create a salted seed to prevent players from reproducing puzzles
   * Combines the date key with a secret salt using SHA-256
   */
  private createSaltedSeed(dateKey: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(dateKey + PUZZLE_SALT)
      .digest('hex');
    
    // Return first 32 characters of hash for a deterministic but unpredictable seed
    return `salted_${hash.substring(0, 32)}`;
  }

  /**
   * Get date key for SGT date with difficulty (format: daily-YYYY-MM-DD-{difficulty})
   * This ensures everyone gets the same puzzle each day for each difficulty
   */
  private getDateKey(date: Date, difficulty: Difficulty): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `daily-${year}-${month}-${day}-${difficulty}`;
  }

  /**
   * Get today's date at 00:00:00 in Singapore Time (SGT)
   * SGT is UTC+8, no daylight saving time
   */
  private getTodayDateSGT(): Date {
    // Get current time in SGT
    const now = new Date();
    const sgtString = now.toLocaleString('en-US', { timeZone: SGT_TIMEZONE });
    const sgtDate = new Date(sgtString);
    
    // Set to midnight SGT
    sgtDate.setHours(0, 0, 0, 0);
    
    return sgtDate;
  }

  /**
   * Get current SGT time info (for debugging/logging)
   */
  getSGTInfo(): { currentSGT: string; date: string; nextResetIn: string } {
    const now = new Date();
    const sgtNow = new Date(now.toLocaleString('en-US', { timeZone: SGT_TIMEZONE }));
    const todaySGT = this.getTodayDateSGT();
    const tomorrowSGT = new Date(todaySGT);
    tomorrowSGT.setDate(tomorrowSGT.getDate() + 1);
    
    const timeUntilReset = tomorrowSGT.getTime() - sgtNow.getTime();
    const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    const year = todaySGT.getFullYear();
    const month = String(todaySGT.getMonth() + 1).padStart(2, '0');
    const day = String(todaySGT.getDate()).padStart(2, '0');
    
    return {
      currentSGT: sgtNow.toLocaleString('en-US', { timeZone: SGT_TIMEZONE }),
      date: `${year}-${month}-${day}`,
      nextResetIn: `${hoursUntilReset}h ${minutesUntilReset}m`
    };
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

    // Calculate streak per difficulty per day
    // Group completed attempts by date+difficulty
    const completedDateDifficulties = new Set<string>();
    attempts
      .filter(a => a.puzzle.date && a.puzzle.difficulty)
      .forEach(a => {
        const dateStr = a.puzzle.date!.toISOString().split('T')[0];
        const difficulty = a.puzzle.difficulty;
        completedDateDifficulties.add(`${dateStr}-${difficulty}`);
      });

    // Calculate streak: count consecutive days where at least one difficulty was completed
    // But count each difficulty separately (so completing easy+medium on same day = 2 streaks)
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Get all unique dates that have completions
    const completedDates = new Set<string>();
    attempts
      .filter(a => a.puzzle.date)
      .forEach(a => {
        const dateStr = a.puzzle.date!.toISOString().split('T')[0];
        completedDates.add(dateStr);
      });

    // Count streak: consecutive days with at least one completion
    // But we'll return the count of unique date+difficulty combinations for the streak
    // This way completing easy and medium on the same day counts as progress
    const todaySGT = this.getTodayDateSGT();
    const todayStr = todaySGT.toISOString().split('T')[0];
    
    // Count backwards from today, counting each day that has at least one completion
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if this date has any completions
      const hasCompletion = Array.from(completedDateDifficulties).some(key => key.startsWith(dateStr + '-'));
      
      if (hasCompletion) {
        // Count how many difficulties were completed on this day
        const difficultiesOnThisDay = Array.from(completedDateDifficulties)
          .filter(key => key.startsWith(dateStr + '-'))
          .length;
        streak += difficultiesOnThisDay;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0 && dateStr === todayStr) {
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

