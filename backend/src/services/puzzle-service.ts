/**
 * Puzzle Service
 * Handles puzzle CRUD operations
 */

import { PrismaClient } from '@prisma/client';
import { sudokuGenerator, Difficulty } from './sudoku-generator';

const prisma = new PrismaClient();

export class PuzzleService {
  /**
   * Get or create a puzzle for casual mode
   */
  async getCasualPuzzle(difficulty: Difficulty): Promise<any> {
    // Try to get an existing unused puzzle
    const existingPuzzle = await prisma.puzzle.findFirst({
      where: {
        mode: 'casual',
        difficulty
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // For casual mode, always generate fresh puzzles
    return this.generatePuzzle('casual', difficulty);
  }

  /**
   * Get or create a challenge puzzle
   */
  async getChallengePuzzle(difficulty: Difficulty, challengeType: string): Promise<any> {
    return this.generatePuzzle('challenge', difficulty);
  }

  /**
   * Generate a new puzzle
   */
  async generatePuzzle(mode: string, difficulty: Difficulty): Promise<any> {
    const puzzleData = sudokuGenerator.generatePuzzle(difficulty);

    const puzzle = await prisma.puzzle.create({
      data: {
        mode,
        difficulty,
        seed: puzzleData.seed,
        givens: JSON.stringify(puzzleData.givens),
        solution: JSON.stringify(puzzleData.solution)
      }
    });

    return {
      id: puzzle.id,
      mode: puzzle.mode,
      difficulty: puzzle.difficulty,
      givens: JSON.parse(puzzle.givens),
      seed: puzzle.seed
    };
  }

  /**
   * Get puzzle by ID
   */
  async getPuzzleById(id: string): Promise<any> {
    const puzzle = await prisma.puzzle.findUnique({
      where: { id }
    });

    if (!puzzle) {
      throw new Error('Puzzle not found');
    }

    return {
      id: puzzle.id,
      mode: puzzle.mode,
      difficulty: puzzle.difficulty,
      givens: JSON.parse(puzzle.givens),
      seed: puzzle.seed
    };
  }

  /**
   * Get solution for a puzzle (for hints)
   */
  async getPuzzleSolution(id: string): Promise<number[][]> {
    const puzzle = await prisma.puzzle.findUnique({
      where: { id }
    });

    if (!puzzle) {
      throw new Error('Puzzle not found');
    }

    return JSON.parse(puzzle.solution);
  }

  /**
   * Validate puzzle solution
   */
  async validateSolution(id: string, board: number[][]): Promise<boolean> {
    const solution = await this.getPuzzleSolution(id);
    
    // Compare boards
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solution[i][j]) {
          return false;
        }
      }
    }

    return true;
  }
}

export const puzzleService = new PuzzleService();

