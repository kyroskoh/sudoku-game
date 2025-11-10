/**
 * Challenge Game Page
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

export const ChallengeGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [completionAcknowledged, setCompletionAcknowledged] = useState(false);
  const { puzzle, loadPuzzle, startGame, isComplete, resetGame } = useGameStore();

  // Clear puzzle when entering challenge mode to show difficulty selection
  useEffect(() => {
    resetGame();
    setShowSelector(true);
  }, []);

  // Show name entry modal when puzzle is completed
  useEffect(() => {
    if (isComplete && !completionAcknowledged) {
      const storedName = getStoredName();
      if (!storedName) {
        // Show name entry modal if no name is stored
        setShowNameEntry(true);
      } else {
        // If name already exists, immediately acknowledge completion to show modal
        setCompletionAcknowledged(true);
      }
    }
  }, [isComplete, completionAcknowledged]);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartChallenge = async () => {
    setLoading(true);
    try {
      const newPuzzle = await api.getPuzzle('challenge', selectedDifficulty);
      loadPuzzle(newPuzzle);
      startGame();
      setShowSelector(false);
    } catch (error) {
      console.error('Error loading challenge:', error);
      alert('Failed to load challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChallenge = () => {
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
  };

  const handleNameSkip = () => {
    setShowNameEntry(false);
    setCompletionAcknowledged(true);
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading challenge...</div>
      </div>
    );
  }

  if (!puzzle || showSelector) {
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
                aria-label={`Select ${diff} difficulty`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
          <button 
            className={styles.startButton} 
            onClick={handleStartChallenge}
            disabled={loading}
          >
            {loading ? 'Loading...' : `Start ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Challenge`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Challenge - {puzzle.difficulty}</h1>
        <p className={styles.subtitle} style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Puzzle: {puzzle.seed || `challenge-${puzzle.id?.slice(0, 8)}`}
        </p>
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
            <h2 className={styles.modalTitle}>🏆 Challenge Complete!</h2>
            <p className={styles.modalStats}>
              Outstanding performance on {puzzle.difficulty}!
            </p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handleNewChallenge}>
                New Challenge
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

