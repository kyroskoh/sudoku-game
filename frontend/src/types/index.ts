/**
 * Type definitions for Sudoku Mastery
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'extreme';
export type GameMode = 'casual' | 'daily' | 'challenge' | 'speed';
export type InputMode = 'pen' | 'pencil';
export type Theme = 'classic' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'lavender' | 'autumn' | 'colorblind-blue' | 'colorblind-high-contrast' | 'colorblind-yellow' | 'colorblind-monochrome' | 'colorblind-dark-blue' | 'colorblind-dark-yellow' | 'colorblind-dark-monochrome' | 'colorblind-sepia';

export type SudokuBoard = number[][];
export type NotesBoard = Set<number>[][];

export interface Puzzle {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  givens: SudokuBoard;
  seed: string;
  date?: Date;
}

export interface GameState {
  puzzle: Puzzle | null;
  board: SudokuBoard;
  notes: NotesBoard;
  selectedCell: { row: number; col: number } | null;
  inputMode: InputMode;
  mistakes: number;
  hintsUsed: number;
  startTime: number | null;
  isPaused: boolean;
  pausedDuration: number; // Total milliseconds paused (accumulated)
  pauseStartTime: number | null; // When the current pause started
  isComplete: boolean;
  hasStarted: boolean; // Whether the user has clicked "I'm Ready"
  history: HistoryState[];
  historyIndex: number;
}

export interface HistoryState {
  board: SudokuBoard;
  notes: NotesBoard;
}

export interface Attempt {
  id: string;
  puzzleId: string;
  mode: GameMode;
  difficulty: Difficulty;
  startedAt: Date;
  finishedAt?: Date;
  timeMs?: number;
  mistakes: number;
  hintsUsed: number;
  result: 'in_progress' | 'completed' | 'failed';
  updatedAt: Date;
}

export interface Settings {
  theme: Theme;
  showMistakes: boolean;
  autoNoteClear: boolean;
  highlightDuplicates: boolean;
  highlightRowCol: boolean;
  soundEnabled: boolean;
  colorblindMode: boolean; // When enabled, forces colorblind theme
}

export interface Stats {
  totalCompleted: number;
  byMode: Record<string, { count: number; totalTime: number }>;
  byDifficulty: Record<string, { count: number; totalTime: number }>;
  bestTimes: Record<string, number>;
}

export interface StreakInfo {
  currentStreak: number;
  lastPlayedDate: Date | null;
}

export interface LeaderboardEntry {
  id: string;
  puzzleId: string;
  userId?: string;
  deviceId?: string;
  displayName?: string;
  timeMs: number;
  createdAt: Date;
}

