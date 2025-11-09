/**
 * Number Pad Component
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './NumberPad.module.css';

export const NumberPad: React.FC = () => {
  const {
    selectedCell,
    setCellValue,
    toggleNote,
    clearCell,
    inputMode,
    puzzle
  } = useGameStore();

  const handleNumberClick = (num: number) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    if (inputMode === 'pen') {
      setCellValue(row, col, num);
    } else {
      toggleNote(row, col, num);
    }
  };

  const handleEraseClick = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    clearCell(row, col);
  };

  const isDisabled = !selectedCell || 
    (puzzle && selectedCell && puzzle.givens[selectedCell.row][selectedCell.col] !== 0);

  return (
    <div className={styles.numberPad} role="group" aria-label="Number pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          className={styles.button}
          onClick={() => handleNumberClick(num)}
          disabled={isDisabled}
          aria-label={`Number ${num}`}
        >
          {num}
        </button>
      ))}
      <button
        className={`${styles.button} ${styles.eraseButton}`}
        onClick={handleEraseClick}
        disabled={isDisabled}
        aria-label="Erase"
      >
        ✕
      </button>
    </div>
  );
};

