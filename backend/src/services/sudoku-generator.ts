/**
 * Sudoku Puzzle Generator and Validator
 * Generates puzzles with unique solutions and difficulty calibration
 */

export type SudokuBoard = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'extreme';

interface PuzzleResult {
  givens: SudokuBoard;
  solution: SudokuBoard;
  difficulty: Difficulty;
  seed: string;
}

export class SudokuGenerator {
  private readonly SIZE = 9;
  private readonly BOX_SIZE = 3;
  private rng: () => number = Math.random;

  /**
   * Generate a complete valid Sudoku solution
   */
  private generateCompleteSolution(): SudokuBoard {
    const board: SudokuBoard = Array(this.SIZE).fill(0).map(() => Array(this.SIZE).fill(0));
    this.fillBoard(board);
    return board;
  }

  /**
   * Fill board using backtracking
   */
  private fillBoard(board: SudokuBoard): boolean {
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (board[row][col] === 0) {
          // Shuffle numbers for randomness
          const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          
          for (const num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
              board[row][col] = num;
              
              if (this.fillBoard(board)) {
                return true;
              }
              
              board[row][col] = 0;
            }
          }
          
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Check if number placement is valid
   */
  private isValidPlacement(board: SudokuBoard, row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < this.SIZE; x++) {
      if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < this.SIZE; x++) {
      if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / this.BOX_SIZE) * this.BOX_SIZE;
    const boxCol = Math.floor(col / this.BOX_SIZE) * this.BOX_SIZE;
    
    for (let i = 0; i < this.BOX_SIZE; i++) {
      for (let j = 0; j < this.BOX_SIZE; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  }

  /**
   * Shuffle array in place using the current RNG
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Create puzzle by removing numbers from solution
   */
  private createPuzzle(solution: SudokuBoard, difficulty: Difficulty): SudokuBoard {
    const puzzle = solution.map(row => [...row]);
    const cellsToRemove = this.getCellsToRemove(difficulty);
    
    // Get all cell positions
    const positions: [number, number][] = [];
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        positions.push([i, j]);
      }
    }
    
    // Shuffle positions
    const shuffledPositions = this.shuffle(positions);
    
    let removed = 0;
    for (const [row, col] of shuffledPositions) {
      if (removed >= cellsToRemove) break;
      
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;
      
      // Check if puzzle still has unique solution
      if (this.hasUniqueSolution(puzzle)) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }
    
    return puzzle;
  }

  /**
   * Get number of cells to remove based on difficulty
   */
  private getCellsToRemove(difficulty: Difficulty): number {
    const removals = {
      easy: 35,      // ~35-40 givens remain
      medium: 45,    // ~30-36 givens remain
      hard: 50,      // ~27-31 givens remain
      expert: 55,    // ~24-26 givens remain
      extreme: 60    // ~17-21 givens remain
    };
    return removals[difficulty];
  }

  /**
   * Check if puzzle has a unique solution
   */
  private hasUniqueSolution(board: SudokuBoard): boolean {
    const solutions: number[] = [];
    this.countSolutions(board.map(row => [...row]), solutions, 2);
    return solutions.length === 1;
  }

  /**
   * Count solutions (stops at maxCount)
   */
  private countSolutions(board: SudokuBoard, solutions: number[], maxCount: number): void {
    if (solutions.length >= maxCount) return;

    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(board, row, col, num)) {
              board[row][col] = num;
              this.countSolutions(board, solutions, maxCount);
              board[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    
    // Found a solution
    solutions.push(1);
  }

  /**
   * Validate a complete board
   */
  public validateBoard(board: SudokuBoard): boolean {
    // Check all rows
    for (let row = 0; row < this.SIZE; row++) {
      const seen = new Set<number>();
      for (let col = 0; col < this.SIZE; col++) {
        const num = board[row][col];
        if (num < 1 || num > 9 || seen.has(num)) return false;
        seen.add(num);
      }
    }

    // Check all columns
    for (let col = 0; col < this.SIZE; col++) {
      const seen = new Set<number>();
      for (let row = 0; row < this.SIZE; row++) {
        const num = board[row][col];
        if (seen.has(num)) return false;
        seen.add(num);
      }
    }

    // Check all 3x3 boxes
    for (let boxRow = 0; boxRow < this.SIZE; boxRow += this.BOX_SIZE) {
      for (let boxCol = 0; boxCol < this.SIZE; boxCol += this.BOX_SIZE) {
        const seen = new Set<number>();
        for (let i = 0; i < this.BOX_SIZE; i++) {
          for (let j = 0; j < this.BOX_SIZE; j++) {
            const num = board[boxRow + i][boxCol + j];
            if (seen.has(num)) return false;
            seen.add(num);
          }
        }
      }
    }

    return true;
  }

  /**
   * Generate a puzzle with specified difficulty
   */
  public generatePuzzle(difficulty: Difficulty, seed?: string): PuzzleResult {
    const actualSeed = seed || this.generateSeed();
    
    // Set up RNG (seeded or default)
    if (seed) {
      this.rng = this.seededRandom(seed);
    } else {
      this.rng = Math.random;
    }

    const solution = this.generateCompleteSolution();
    const givens = this.createPuzzle(solution, difficulty);

    // Restore default RNG
    this.rng = Math.random;

    // Validate: Replace any null/undefined with 0
    const cleanGivens = givens.map(row => 
      row.map(cell => (cell === null || cell === undefined) ? 0 : cell)
    );
    const cleanSolution = solution.map(row => 
      row.map(cell => (cell === null || cell === undefined || cell === 0) ? 
        // If solution has 0/null/undefined, something is very wrong
        (cell || 1) : cell
      )
    );

    // CRITICAL VALIDATION: Ensure givens match solution where givens are non-zero
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (cleanGivens[row][col] !== 0 && cleanGivens[row][col] !== cleanSolution[row][col]) {
          console.error(`[Puzzle Generation] MISMATCH at [${row}][${col}]: given=${cleanGivens[row][col]}, solution=${cleanSolution[row][col]}`);
          // Fix: Set given to match solution
          cleanGivens[row][col] = cleanSolution[row][col];
        }
      }
    }

    // CRITICAL VALIDATION: Ensure puzzle has unique solution
    const hasUnique = this.hasUniqueSolution(cleanGivens);
    if (!hasUnique) {
      console.error(`[Puzzle Generation] Puzzle does not have unique solution for seed: ${actualSeed}`);
      
      // For seeded puzzles (like daily), we need deterministic retries
      // For non-seeded puzzles, we can retry with different random seeds
      if (seed) {
        // Seeded puzzle: Try with modified deterministic seeds
        let retries = 0;
        let validPuzzle: PuzzleResult | null = null;
        
        while (retries < 5 && !validPuzzle) {
          retries++;
          console.log(`[Puzzle Generation] Retry ${retries}/5 for seeded puzzle: ${actualSeed}`);
          
          // Use a modified seed for retry (still deterministic)
          const retrySeed = `${actualSeed}-retry${retries}`;
          this.rng = this.seededRandom(retrySeed);
          
          const retrySolution = this.generateCompleteSolution();
          const retryGivens = this.createPuzzle(retrySolution, difficulty);
          this.rng = Math.random;
          
          // Clean retry puzzle
          const cleanRetryGivens = retryGivens.map(row => 
            row.map(cell => (cell === null || cell === undefined) ? 0 : cell)
          );
          const cleanRetrySolution = retrySolution.map(row => 
            row.map(cell => (cell === null || cell === undefined || cell === 0) ? (cell || 1) : cell)
          );
          
          // Ensure givens match solution
          for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
              if (cleanRetryGivens[row][col] !== 0 && cleanRetryGivens[row][col] !== cleanRetrySolution[row][col]) {
                cleanRetryGivens[row][col] = cleanRetrySolution[row][col];
              }
            }
          }
          
          if (this.hasUniqueSolution(cleanRetryGivens)) {
            validPuzzle = {
              givens: cleanRetryGivens,
              solution: cleanRetrySolution,
              difficulty,
              seed: actualSeed // Keep original seed for display
            };
            console.log(`[Puzzle Generation] Successfully generated valid puzzle after ${retries} retries`);
          }
        }
        
        if (validPuzzle) {
          return validPuzzle;
        } else {
          console.error(`[Puzzle Generation] Failed to generate valid puzzle after 5 retries for seed: ${actualSeed}`);
          // For daily puzzles, we MUST return a valid puzzle, so log error but continue
        }
      } else {
        // Non-seeded puzzle: Retry with fresh random generation
        let retries = 0;
        let validPuzzle: PuzzleResult | null = null;
        
        while (retries < 3 && !validPuzzle) {
          retries++;
          console.log(`[Puzzle Generation] Retry ${retries}/3 for random puzzle`);
          
          this.rng = Math.random;
          const retrySolution = this.generateCompleteSolution();
          const retryGivens = this.createPuzzle(retrySolution, difficulty);
          
          // Clean retry puzzle
          const cleanRetryGivens = retryGivens.map(row => 
            row.map(cell => (cell === null || cell === undefined) ? 0 : cell)
          );
          const cleanRetrySolution = retrySolution.map(row => 
            row.map(cell => (cell === null || cell === undefined || cell === 0) ? (cell || 1) : cell)
          );
          
          // Ensure givens match solution
          for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
              if (cleanRetryGivens[row][col] !== 0 && cleanRetryGivens[row][col] !== cleanRetrySolution[row][col]) {
                cleanRetryGivens[row][col] = cleanRetrySolution[row][col];
              }
            }
          }
          
          if (this.hasUniqueSolution(cleanRetryGivens)) {
            validPuzzle = {
              givens: cleanRetryGivens,
              solution: cleanRetrySolution,
              difficulty,
              seed: this.generateSeed() // New random seed
            };
            console.log(`[Puzzle Generation] Successfully generated valid puzzle after ${retries} retries`);
          }
        }
        
        if (validPuzzle) {
          return validPuzzle;
        } else {
          console.error(`[Puzzle Generation] Failed to generate valid puzzle after 3 retries`);
        }
      }
    }

    return {
      givens: cleanGivens,
      solution: cleanSolution,
      difficulty,
      seed: actualSeed
    };
  }

  /**
   * Generate a random seed
   */
  private generateSeed(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Seeded random number generator (simple)
   */
  private seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    
    return function() {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  /**
   * Get hint for a puzzle
   */
  public getHint(board: SudokuBoard, solution: SudokuBoard): { row: number; col: number; value: number } | null {
    const emptyCells: Array<{ row: number; col: number }> = [];
    
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    // Return a random empty cell's solution
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      row: randomCell.row,
      col: randomCell.col,
      value: solution[randomCell.row][randomCell.col]
    };
  }

  /**
   * Check if current board state is valid (no conflicts)
   */
  public isValidState(board: SudokuBoard): boolean {
    // Check rows
    for (let row = 0; row < this.SIZE; row++) {
      const seen = new Set<number>();
      for (let col = 0; col < this.SIZE; col++) {
        const num = board[row][col];
        if (num !== 0) {
          if (seen.has(num)) return false;
          seen.add(num);
        }
      }
    }

    // Check columns
    for (let col = 0; col < this.SIZE; col++) {
      const seen = new Set<number>();
      for (let row = 0; row < this.SIZE; row++) {
        const num = board[row][col];
        if (num !== 0) {
          if (seen.has(num)) return false;
          seen.add(num);
        }
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < this.SIZE; boxRow += this.BOX_SIZE) {
      for (let boxCol = 0; boxCol < this.SIZE; boxCol += this.BOX_SIZE) {
        const seen = new Set<number>();
        for (let i = 0; i < this.BOX_SIZE; i++) {
          for (let j = 0; j < this.BOX_SIZE; j++) {
            const num = board[boxRow + i][boxCol + j];
            if (num !== 0) {
              if (seen.has(num)) return false;
              seen.add(num);
            }
          }
        }
      }
    }

    return true;
  }
}

export const sudokuGenerator = new SudokuGenerator();

