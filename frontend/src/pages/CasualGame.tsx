/**
 * Casual Game Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Grid } from '../components/Grid';
import { NumberPad } from '../components/NumberPad';
import { Controls } from '../components/Controls';
import { NameEntryModal } from '../components/NameEntryModal';
import { api } from '../utils/api';
import { getStoredName } from '../utils/localStorage';
import type { Difficulty } from '../types';
import styles from './GamePage.module.css';

export const CasualGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [completionAcknowledged, setCompletionAcknowledged] = useState(false);
  const { puzzle, loadPuzzle, startGame, isComplete, resetGame } = useGameStore();

  // Clear puzzle when entering casual mode to show difficulty selection
  useEffect(() => {
    resetGame();
    setShowSelector(true);
  }, []);

  // Show name entry modal when puzzle is completed
  useEffect(() => {
    if (isComplete && !completionAcknowledged) {
      // Only show name entry if no name is stored yet
      const storedName = getStoredName();
      if (!storedName) {
        setShowNameEntry(true);
      }
    }
  }, [isComplete, completionAcknowledged]);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const newPuzzle = await api.getPuzzle('casual', selectedDifficulty);
      loadPuzzle(newPuzzle);
      startGame();
      setShowSelector(false);
    } catch (error) {
      console.error('Error loading puzzle:', error);
      alert('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    resetGame();
    setShowSelector(true);
    setCompletionAcknowledged(false);
    setShowNameEntry(false);
  };

  const handleChangeDifficulty = () => {
    resetGame();
    setShowSelector(true);
    setCompletionAcknowledged(false);
    setShowNameEntry(false);
  };

  const handleNameSubmit = () => {
    setShowNameEntry(false);
    setCompletionAcknowledged(true);
    // Name is already stored by the modal
  };

  const handleNameSkip = () => {
    setShowNameEntry(false);
    setCompletionAcknowledged(true);
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading puzzle...</div>
      </div>
    );
  }

  if (!puzzle || showSelector) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎮 Casual Mode</h1>
          <p className={styles.subtitle}>Practice and improve your Sudoku skills</p>
        </div>

        <div className={styles.difficultySelector}>
          <label className={styles.difficultyLabel}>Select Your Difficulty:</label>
          <div className={styles.difficultyButtons}>
            {difficulties.map((diff) => (
              <button
                key={diff}
                className={`${styles.difficultyButton} ${
                  selectedDifficulty === diff ? styles.selected : ''
                }`}
                onClick={() => setSelectedDifficulty(diff)}
                aria-label={`Select ${diff} difficulty`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
          <button 
            className={styles.startButton} 
            onClick={handleStartGame}
            disabled={loading}
          >
            {loading ? 'Loading...' : `Start ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Game`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Casual - {puzzle.difficulty}</h1>
        <button 
          className={styles.secondaryButton}
          onClick={handleChangeDifficulty}
          style={{ marginTop: '1rem' }}
        >
          ← Change Difficulty
        </button>
      </div>

      <div className={styles.gameArea}>
        <Controls />
        <Grid />
        <NumberPad />
      </div>

      <NameEntryModal
        isOpen={showNameEntry}
        onSubmit={handleNameSubmit}
        onSkip={handleNameSkip}
      />

      {isComplete && completionAcknowledged && (
        <div className={styles.completionModal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>🎉 Congratulations!</h2>
            <p className={styles.modalStats}>
              You completed the {puzzle.difficulty} puzzle!
            </p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handleNewGame}>
                New Game
              </button>
              <button className={styles.modalButton} onClick={() => navigate('/leaderboard')}>
                🏆 View Leaderboard
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

