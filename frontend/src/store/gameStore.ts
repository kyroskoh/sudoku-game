/**
 * Game Store
 * Global state management using Zustand
 */

import { create } from 'zustand';
import type { GameState, Puzzle, SudokuBoard, NotesBoard, InputMode, Settings, Attempt } from '../types';
import { getSettings, saveSettings, queueAttempt } from '../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface GameStore extends GameState {
  settings: Settings;
  
  // Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  selectCell: (row: number, col: number) => void;
  clearSelection: () => void;
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
  setCellValue: (row: number, col: number, value: number) => void;
  toggleNote: (row: number, col: number, value: number) => void;
  clearCell: (row: number, col: number) => void;
  undo: () => void;
  redo: () => void;
  addMistake: () => void;
  addHint: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  completeGame: () => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Helpers
  pushHistory: (board: SudokuBoard, notes: NotesBoard) => void;
}

const createEmptyBoard = (): SudokuBoard => {
  return Array(9).fill(0).map(() => Array(9).fill(0));
};

const createEmptyNotes = (): NotesBoard => {
  return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set<number>()));
};

const cloneBoard = (board: SudokuBoard): SudokuBoard => {
  return board.map(row => [...row]);
};

const cloneNotes = (notes: NotesBoard): NotesBoard => {
  return notes.map(row => row.map(cell => new Set(cell)));
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  puzzle: null,
  board: createEmptyBoard(),
  notes: createEmptyNotes(),
  selectedCell: null,
  inputMode: 'pen',
  mistakes: 0,
  hintsUsed: 0,
  startTime: null,
  isPaused: false,
  isComplete: false,
  history: [],
  historyIndex: -1,
  settings: getSettings(),

  // Actions
  loadPuzzle: (puzzle: Puzzle) => {
    const board = puzzle.givens.map(row => [...row]);
    const notes = createEmptyNotes();
    
    set({
      puzzle,
      board,
      notes,
      selectedCell: null,
      mistakes: 0,
      hintsUsed: 0,
      startTime: null,
      isPaused: false,
      isComplete: false,
      history: [{ board: cloneBoard(board), notes: cloneNotes(notes) }],
      historyIndex: 0
    });
  },

  selectCell: (row: number, col: number) => {
    set({ selectedCell: { row, col } });
  },

  clearSelection: () => {
    set({ selectedCell: null });
  },

  setInputMode: (mode: InputMode) => {
    set({ inputMode: mode });
  },

  toggleInputMode: () => {
    const current = get().inputMode;
    set({ inputMode: current === 'pen' ? 'pencil' : 'pen' });
  },

  setCellValue: (row: number, col: number, value: number) => {
    const state = get();
    
    // Can't modify givens
    if (state.puzzle && state.puzzle.givens[row][col] !== 0) {
      return;
    }

    const newBoard = cloneBoard(state.board);
    const newNotes = cloneNotes(state.notes);
    
    newBoard[row][col] = value;
    
    // Clear notes for this cell
    newNotes[row][col].clear();
    
    // Auto-clear notes if enabled
    if (state.settings.autoNoteClear && value !== 0) {
      // Clear notes in same row
      for (let c = 0; c < 9; c++) {
        newNotes[row][c].delete(value);
      }
      
      // Clear notes in same column
      for (let r = 0; r < 9; r++) {
        newNotes[r][col].delete(value);
      }
      
      // Clear notes in same box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          newNotes[boxRow + i][boxCol + j].delete(value);
        }
      }
    }
    
    set({ board: newBoard, notes: newNotes });
    get().pushHistory(newBoard, newNotes);
  },

  toggleNote: (row: number, col: number, value: number) => {
    const state = get();
    
    // Can't modify givens
    if (state.puzzle && state.puzzle.givens[row][col] !== 0) {
      return;
    }
    
    // Can't add notes if cell has a value
    if (state.board[row][col] !== 0) {
      return;
    }

    const newNotes = cloneNotes(state.notes);
    
    if (newNotes[row][col].has(value)) {
      newNotes[row][col].delete(value);
    } else {
      newNotes[row][col].add(value);
    }
    
    set({ notes: newNotes });
    get().pushHistory(state.board, newNotes);
  },

  clearCell: (row: number, col: number) => {
    const state = get();
    
    // Can't modify givens
    if (state.puzzle && state.puzzle.givens[row][col] !== 0) {
      return;
    }

    const newBoard = cloneBoard(state.board);
    const newNotes = cloneNotes(state.notes);
    
    newBoard[row][col] = 0;
    newNotes[row][col].clear();
    
    set({ board: newBoard, notes: newNotes });
    get().pushHistory(newBoard, newNotes);
  },

  pushHistory: (board: SudokuBoard, notes: NotesBoard) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ board: cloneBoard(board), notes: cloneNotes(notes) });
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({ historyIndex: state.historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const historyState = state.history[newIndex];
      set({
        board: cloneBoard(historyState.board),
        notes: cloneNotes(historyState.notes),
        historyIndex: newIndex
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const historyState = state.history[newIndex];
      set({
        board: cloneBoard(historyState.board),
        notes: cloneNotes(historyState.notes),
        historyIndex: newIndex
      });
    }
  },

  addMistake: () => {
    set(state => ({ mistakes: state.mistakes + 1 }));
  },

  addHint: () => {
    set(state => ({ hintsUsed: state.hintsUsed + 1 }));
  },

  startGame: () => {
    set({ startTime: Date.now(), isPaused: false });
  },

  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  completeGame: () => {
    const state = get();
    
    // Calculate time
    const timeMs = state.startTime ? Date.now() - state.startTime : 0;
    
    // Create attempt
    if (state.puzzle && state.startTime) {
      const attempt: Attempt = {
        id: uuidv4(),
        puzzleId: state.puzzle.id,
        mode: state.puzzle.mode,
        difficulty: state.puzzle.difficulty,
        startedAt: new Date(state.startTime),
        finishedAt: new Date(),
        timeMs,
        mistakes: state.mistakes,
        hintsUsed: state.hintsUsed,
        result: 'completed',
        updatedAt: new Date()
      };
      
      // Queue attempt for syncing
      queueAttempt(attempt);
      console.log('✅ Puzzle completed! Attempt queued for sync:', attempt);
    }
    
    set({ isComplete: true, isPaused: true });
  },

  resetGame: () => {
    const state = get();
    if (state.puzzle) {
      get().loadPuzzle(state.puzzle);
    }
  },

  updateSettings: (newSettings: Partial<Settings>) => {
    const state = get();
    const updatedSettings = { ...state.settings, ...newSettings };
    set({ settings: updatedSettings });
    saveSettings(updatedSettings);
  }
}));

