/**
 * Game Controls Component
 */

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Controls.module.css';

export const Controls: React.FC = () => {
  const {
    inputMode,
    mistakes,
    hintsUsed,
    startTime,
    isPaused,
    pausedDuration,
    pauseStartTime,
    isComplete,
    historyIndex,
    history,
    toggleInputMode,
    undo,
    redo,
    pauseGame,
    resumeGame
  } = useGameStore();

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime || isComplete) return;

    const interval = setInterval(() => {
      let currentPauseDuration = pausedDuration;
      // If currently paused, add the current pause duration
      if (isPaused && pauseStartTime) {
        currentPauseDuration += Date.now() - pauseStartTime;
      }
      // Calculate elapsed time excluding paused duration
      setElapsedTime(Date.now() - startTime - currentPauseDuration);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused, pausedDuration, pauseStartTime, isComplete]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className={styles.controls}>
      {/* Timer */}
      {startTime && (
        <div className={styles.timer} aria-label="Timer">
          {formatTime(elapsedTime)}
        </div>
      )}

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat} aria-label={`Mistakes: ${mistakes}`}>
          <span className={styles.icon}>❌</span>
          <span>{mistakes}</span>
        </div>
        <div className={styles.stat} aria-label={`Hints used: ${hintsUsed}`}>
          <span className={styles.icon}>💡</span>
          <span>{hintsUsed}</span>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className={`${styles.button} ${styles.modeButton} ${inputMode === 'pen' ? styles.active : ''}`}
          onClick={() => inputMode !== 'pen' && toggleInputMode()}
          aria-label="Pen mode"
          aria-pressed={inputMode === 'pen'}
        >
          ✏️ Pen
        </button>
        <button
          className={`${styles.button} ${styles.modeButton} ${inputMode === 'pencil' ? styles.active : ''}`}
          onClick={() => inputMode !== 'pencil' && toggleInputMode()}
          aria-label="Pencil mode"
          aria-pressed={inputMode === 'pencil'}
        >
          ✎ Pencil
        </button>
      </div>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          ↶ Undo
        </button>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={redo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          ↷ Redo
        </button>
      </div>

      {/* Pause/Resume */}
      {!isComplete && startTime && (
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={isPaused ? resumeGame : pauseGame}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
      )}
    </div>
  );
};

