/**
 * Challenge Game Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Grid } from '../components/Grid';
import { NumberPad } from '../components/NumberPad';
import { Controls } from '../components/Controls';
import { api } from '../utils/api';
import type { Difficulty } from '../types';
import styles from './GamePage.module.css';

export const ChallengeGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const { puzzle, loadPuzzle, startGame, isComplete, resetGame } = useGameStore();

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartChallenge = async () => {
    setLoading(true);
    try {
      const newPuzzle = await api.getPuzzle('challenge', selectedDifficulty);
      loadPuzzle(newPuzzle);
      startGame();
    } catch (error) {
      console.error('Error loading challenge:', error);
      alert('Failed to load challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChallenge = () => {
    resetGame();
    handleStartChallenge();
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading challenge...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 Challenge Mode</h1>
          <p className={styles.subtitle}>Test your skills under pressure!</p>
        </div>

        <div className={styles.difficultySelector}>
          <label className={styles.difficultyLabel}>Select Challenge Difficulty:</label>
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
          <button className={styles.startButton} onClick={handleStartChallenge}>
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Challenge - {puzzle.difficulty}</h1>
      </div>

      <div className={styles.gameArea}>
        <Controls />
        <Grid />
        <NumberPad />
      </div>

      {isComplete && (
        <div className={styles.completionModal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>🏆 Challenge Complete!</h2>
            <p className={styles.modalStats}>Outstanding performance!</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handleNewChallenge}>
                New Challenge
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

