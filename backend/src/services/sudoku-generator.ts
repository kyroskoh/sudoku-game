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
    // Initialize board with zeros (ensure no undefined values)
    const board: SudokuBoard = [];
    for (let row = 0; row < this.SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < this.SIZE; col++) {
        board[row][col] = 0;
      }
    }
    
    const success = this.fillBoard(board);
    
    if (!success) {
      throw new Error('Failed to generate complete Sudoku solution - backtracking failed');
    }
    
    // Verify board is completely filled (no zeros or undefined)
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        const cell = board[row][col];
        if (cell === undefined || cell === null) {
          throw new Error(`Generated solution has undefined/null cell at [${row}][${col}]`);
        }
        if (cell === 0) {
          throw new Error(`Generated solution has empty cell at [${row}][${col}]`);
        }
        if (cell < 1 || cell > 9) {
          throw new Error(`Generated solution has invalid value ${cell} at [${row}][${col}]`);
        }
      }
    }
    
    return board;
  }

  /**
   * Fill board using backtracking
   */
  private fillBoard(board: SudokuBoard): boolean {
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        // Ensure cell exists and is 0 (empty)
        if (board[row] === undefined || board[row][col] === undefined) {
          console.error(`[fillBoard] Board has undefined at [${row}][${col}]`);
          return false;
        }
        
        if (board[row][col] === 0) {
          // Shuffle numbers for randomness
          const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          
          for (const num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
              board[row][col] = num;
              
              if (this.fillBoard(board)) {
                return true;
              }
              
              // Backtrack: reset to 0
              board[row][col] = 0;
            }
          }
          
          // No valid number found for this cell
          return false;
        }
      }
    }
    // All cells filled
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

    // Try to generate solution with retries if backtracking fails
    let solution: SudokuBoard | null = null;
    let retries = 0;
    const maxRetries = 10;
    
    while (retries < maxRetries && !solution) {
      try {
        solution = this.generateCompleteSolution();
        break; // Success!
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          // Restore default RNG before throwing
          this.rng = Math.random;
          throw new Error(`Failed to generate solution after ${maxRetries} retries. Seed: ${actualSeed}. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Modify seed slightly for retry (add retry counter to make it different)
        if (seed) {
          const retrySeed = `${seed}-retry${retries}`;
          this.rng = this.seededRandom(retrySeed);
        }
        // For non-seeded, Math.random is already different each time
      }
    }
    
    // Ensure solution was generated
    if (!solution) {
      this.rng = Math.random;
      throw new Error('Solution generation failed - solution is null');
    }
    
    const givens = this.createPuzzle(solution, difficulty);

    // Restore default RNG
    this.rng = Math.random;

    // Validate: Replace any null/undefined with 0 for givens (empty cells)
    const cleanGivens = givens.map(row => 
      row.map(cell => (cell === null || cell === undefined) ? 0 : cell)
    );
    
    // CRITICAL: Solution should NEVER have null/undefined/0 - if it does, generation failed
    const cleanSolution: SudokuBoard = [];
    for (let row = 0; row < this.SIZE; row++) {
      cleanSolution[row] = [];
      for (let col = 0; col < this.SIZE; col++) {
        const cell = solution[row][col];
        if (cell === null || cell === undefined || cell === 0 || cell < 1 || cell > 9) {
          console.error(`[Puzzle Generation] CRITICAL: Invalid solution value at [${row}][${col}]: ${cell}`);
          // Don't try to "fix" it - regenerate instead
          throw new Error(`Solution generation failed: invalid value ${cell} at [${row}][${col}]. This indicates a bug in puzzle generation.`);
        }
        cleanSolution[row][col] = cell;
      }
    }

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
          
          // Validate retry solution - should never have invalid values
          const cleanRetrySolution: SudokuBoard = [];
          for (let r = 0; r < this.SIZE; r++) {
            cleanRetrySolution[r] = [];
            for (let c = 0; c < this.SIZE; c++) {
              const cell = retrySolution[r][c];
              if (cell === null || cell === undefined || cell === 0 || cell < 1 || cell > 9) {
                throw new Error(`Retry solution invalid at [${r}][${c}]: ${cell}`);
              }
              cleanRetrySolution[r][c] = cell;
            }
          }
          
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
          
          // Validate retry solution - should never have invalid values
          const cleanRetrySolution: SudokuBoard = [];
          for (let r = 0; r < this.SIZE; r++) {
            cleanRetrySolution[r] = [];
            for (let c = 0; c < this.SIZE; c++) {
              const cell = retrySolution[r][c];
              if (cell === null || cell === undefined || cell === 0 || cell < 1 || cell > 9) {
                throw new Error(`Retry solution invalid at [${r}][${c}]: ${cell}`);
              }
              cleanRetrySolution[r][c] = cell;
            }
          }
          
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

    // FINAL VALIDATION: Ensure solution is valid (contains 1-9 in each row/column/box)
    const solutionValid = this.validateBoard(cleanSolution);
    if (!solutionValid) {
      console.error(`[Puzzle Generation] Generated solution is INVALID for seed: ${actualSeed}`);
      throw new Error(`Failed to generate valid puzzle solution for seed: ${actualSeed}`);
    }

    // Validate that givens are a subset of solution
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (cleanGivens[row][col] !== 0 && cleanGivens[row][col] !== cleanSolution[row][col]) {
          console.error(`[Puzzle Generation] CRITICAL: Given[${row}][${col}] = ${cleanGivens[row][col]} but Solution[${row}][${col}] = ${cleanSolution[row][col]}`);
          throw new Error(`Puzzle generation failed: givens don't match solution`);
        }
      }
    }

    console.log(`[Puzzle Generation] ✅ Generated valid puzzle for seed: ${actualSeed}, difficulty: ${difficulty}`);

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

