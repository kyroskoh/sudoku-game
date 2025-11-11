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
import type { Difficulty } from '../types';
import styles from './GamePage.module.css';

export const CasualGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [completionAcknowledged, setCompletionAcknowledged] = useState(false);
  const [qualifiesForTop10, setQualifiesForTop10] = useState(false);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const { puzzle, loadPuzzle, isComplete, resetGame, startTime, pausedDuration, pauseStartTime, isPaused } = useGameStore();

  // Clear puzzle when entering casual mode to show difficulty selection
  useEffect(() => {
    resetGame();
    setShowSelector(true);
  }, []);

  // Check top 10 qualification and show name entry modal when puzzle is completed
  useEffect(() => {
    if (isComplete && !completionAcknowledged && puzzle) {
      // Calculate completion time
      let timeMs = 0;
      if (startTime) {
        let currentPauseDuration = pausedDuration;
        if (isPaused && pauseStartTime) {
          currentPauseDuration += Date.now() - pauseStartTime;
        }
        timeMs = Date.now() - startTime - currentPauseDuration;
      }
      setCompletionTime(timeMs);
      
      // Check if user qualifies for top 10
      const checkTop10 = async () => {
        try {
          const qualifies = await api.qualifiesForTop10(puzzle.mode, puzzle.difficulty, timeMs);
          setQualifiesForTop10(qualifies);
          
          // Only show name entry modal if user qualifies for top 10
          if (qualifies) {
            setShowNameEntry(true);
          } else {
            // Skip directly to completion modal
            setCompletionAcknowledged(true);
          }
        } catch (error) {
          console.error('Error checking top 10 qualification:', error);
          // On error, show name entry modal to be safe
          setShowNameEntry(true);
        }
      };
      
      checkTop10();
    }
  }, [isComplete, completionAcknowledged, puzzle, startTime, pausedDuration, pauseStartTime, isPaused]);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const newPuzzle = await api.getPuzzle('casual', selectedDifficulty);
      loadPuzzle(newPuzzle);
      // Don't start game automatically - wait for "I'm Ready" button
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

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        <p className={styles.subtitle} style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Puzzle: {puzzle.seed || `casual-${puzzle.id?.slice(0, 8)}`}
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
            <h2 className={styles.modalTitle}>🎉 Congratulations!</h2>
            <p className={styles.modalStats}>
              You completed the {puzzle.difficulty} puzzle!
              {completionTime && (
                <>
                  <br />
                  <strong>Time: {formatTime(completionTime)}</strong>
                </>
              )}
              {qualifiesForTop10 && (
                <>
                  <br />
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>🏆 Top 10 Leaderboard!</span>
                </>
              )}
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

