/**
 * Casual Game Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Grid } from '../components/Grid';
import { NumberPad } from '../components/NumberPad';
import { Controls } from '../components/Controls';
import { api } from '../utils/api';
import type { Difficulty } from '../types';
import styles from './GamePage.module.css';

export const CasualGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [loading, setLoading] = useState(false);
  const { puzzle, loadPuzzle, startGame, isComplete, resetGame } = useGameStore();

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const newPuzzle = await api.getPuzzle('casual', selectedDifficulty);
      loadPuzzle(newPuzzle);
      startGame();
    } catch (error) {
      console.error('Error loading puzzle:', error);
      alert('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    resetGame();
    handleStartGame();
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading puzzle...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Casual Mode</h1>
          <p className={styles.subtitle}>Practice and improve your Sudoku skills</p>
        </div>

        <div className={styles.difficultySelector}>
          <label className={styles.difficultyLabel}>Select Difficulty:</label>
          <div className={styles.difficultyButtons}>
            {difficulties.map((diff) => (
              <button
                key={diff}
                className={`${styles.difficultyButton} ${
                  selectedDifficulty === diff ? styles.selected : ''
                }`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
          <button className={styles.startButton} onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Casual - {puzzle.difficulty}</h1>
      </div>

      <div className={styles.gameArea}>
        <Controls />
        <Grid />
        <NumberPad />
      </div>

      {isComplete && (
        <div className={styles.completionModal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>🎉 Congratulations!</h2>
            <p className={styles.modalStats}>You completed the puzzle!</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handleNewGame}>
                New Game
              </button>
              <button className={styles.modalButton} onClick={() => navigate('/')}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

