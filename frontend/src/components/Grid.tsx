/**
 * Sudoku Grid Component
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Grid.module.css';

export const Grid: React.FC = () => {
  const {
    puzzle,
    board,
    notes,
    selectedCell,
    settings,
    selectCell,
    setCellValue,
    toggleNote,
    inputMode
  } = useGameStore();

  if (!puzzle) return null;

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

    return (
      <div
        key={index}
        className={getCellClassName(row, col)}
        onClick={() => handleCellClick(row, col)}
        role="gridcell"
        aria-label={`Cell ${row + 1}, ${col + 1}`}
        tabIndex={0}
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

