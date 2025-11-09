/**
 * Sudoku Grid Component
 */

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Grid.module.css';

export const Grid: React.FC = () => {
  const {
    puzzle,
    board,
    notes,
    selectedCell,
    settings,
    isComplete,
    selectCell,
    setCellValue,
    toggleNote,
    inputMode,
    completeGame
  } = useGameStore();

  const [showAnswers, setShowAnswers] = useState(false);
  const [solution, setSolution] = useState<number[][] | null>(null);

  // Check for ?showans=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showAns = params.get('showans') === 'true';
    setShowAnswers(showAns);

    // Fetch solution if showans is enabled and we have a puzzle
    if (showAns && puzzle && puzzle.id) {
      fetchSolution(puzzle.id);
    }
  }, [puzzle]);

  const fetchSolution = async (puzzleId: string) => {
    try {
      const response = await fetch(`/api/puzzles/${puzzleId}?showsolution=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.solution) {
          setSolution(data.solution);
          console.log('🔓 Debug mode activated: Showing answers');
        }
      }
    } catch (error) {
      console.error('Error fetching solution:', error);
    }
  };

  if (!puzzle) return null;

  // Check for puzzle completion whenever board changes
  useEffect(() => {
    if (!puzzle || isComplete) return;

    // Check if board is completely filled
    const isFilled = board.every(row => row.every(cell => cell !== 0));
    
    if (isFilled) {
      // Check if solution is valid
      const isValid = checkSolution(board);
      if (isValid) {
        completeGame();
      }
    }
  }, [board, puzzle, isComplete, completeGame]);

  // Validate the solution
  const checkSolution = (currentBoard: number[][]): boolean => {
    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set<number>();
      for (let col = 0; col < 9; col++) {
        const value = currentBoard[row][col];
        if (value < 1 || value > 9 || seen.has(value)) return false;
        seen.add(value);
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set<number>();
      for (let row = 0; row < 9; row++) {
        const value = currentBoard[row][col];
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        const seen = new Set<number>();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const value = currentBoard[boxRow + i][boxCol + j];
            if (seen.has(value)) return false;
            seen.add(value);
          }
        }
      }
    }

    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    selectCell(row, col);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    if (e.key >= '1' && e.key <= '9') {
      const value = parseInt(e.key);
      if (inputMode === 'pen') {
        setCellValue(row, col, value);
      } else {
        toggleNote(row, col, value);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      setCellValue(row, col, 0);
    } else if (e.key === 'ArrowUp' && row > 0) {
      selectCell(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < 8) {
      selectCell(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
      selectCell(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < 8) {
      selectCell(row, col + 1);
    }
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell || !settings.highlightRowCol) return false;
    return selectedCell.row === row || selectedCell.col === col;
  };

  const isDuplicate = (row: number, col: number): boolean => {
    if (!selectedCell || !settings.highlightDuplicates) return false;
    const value = board[row][col];
    if (value === 0) return false;

    const selectedValue = board[selectedCell.row][selectedCell.col];
    return value === selectedValue && (row !== selectedCell.row || col !== selectedCell.col);
  };

  const isGiven = (row: number, col: number): boolean => {
    return puzzle.givens[row][col] !== 0;
  };

  const getCellClassName = (row: number, col: number): string => {
    const classes = [styles.cell];

    if (isGiven(row, col)) {
      classes.push(styles.given);
    } else if (board[row][col] !== 0) {
      classes.push(styles.user);
    }

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes.push(styles.selected);
    } else if (isHighlighted(row, col)) {
      classes.push(styles.highlighted);
    }

    if (isDuplicate(row, col)) {
      classes.push(styles.duplicate);
    }

    return classes.join(' ');
  };

  const renderCell = (row: number, col: number, index: number) => {
    const value = board[row][col];
    const cellNotes = notes[row][col];
    const isEmpty = value === 0;

    return (
      <div
        key={index}
        className={getCellClassName(row, col)}
        onClick={() => handleCellClick(row, col)}
        role="gridcell"
        aria-label={`Cell ${row + 1}, ${col + 1}`}
        tabIndex={0}
        style={{
          position: 'relative'
        }}
      >
        {value !== 0 ? (
          value
        ) : cellNotes.size > 0 ? (
          <div className={styles.notes}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <div key={n} className={styles.note}>
                {cellNotes.has(n) ? n : ''}
              </div>
            ))}
          </div>
        ) : null}
        
        {/* Debug mode: Show solution in corner */}
        {showAnswers && isEmpty && solution && solution[row] && solution[row][col] && (
          <div className={styles.debugAnswer}>
            {solution[row][col]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={styles.grid}
      role="grid"
      onKeyDown={handleKeyPress}
      tabIndex={-1}
    >
      {board.flatMap((row, rowIndex) =>
        row.map((_, colIndex) => renderCell(rowIndex, colIndex, rowIndex * 9 + colIndex))
      )}
    </div>
  );
};

