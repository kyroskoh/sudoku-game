/**
 * Daily Game Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Grid } from '../components/Grid';
import { NumberPad } from '../components/NumberPad';
import { Controls } from '../components/Controls';
import { NameEntryModal } from '../components/NameEntryModal';
import { api } from '../utils/api';
import { getDeviceId } from '../utils/localStorage';
import type { Difficulty } from '../types';
import styles from './GamePage.module.css';

export const DailyGame: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [streak, setStreak] = useState({ currentStreak: 0, lastPlayedDate: null });
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [completionAcknowledged, setCompletionAcknowledged] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { puzzle, loadPuzzle, isComplete, resetGame } = useGameStore();

  // Clear puzzle when entering daily mode to show difficulty selection
  useEffect(() => {
    resetGame();
    setShowSelector(true);
    setIsCompleted(false);
  }, []);
  
  // Check completion status when difficulty changes
  useEffect(() => {
    const checkCompletion = async () => {
      if (!showSelector) return; // Only check when selector is visible
      
      try {
        const deviceId = getDeviceId();
        const response = await api.getDailyPuzzle(selectedDifficulty, undefined, deviceId);
        setIsCompleted(response.isCompleted);
      } catch (error) {
        console.error('Error checking completion status:', error);
      }
    };
    
    checkCompletion();
  }, [selectedDifficulty, showSelector]);

  // Show name entry modal when puzzle is completed (always show, pre-filled if name exists)
  useEffect(() => {
    if (isComplete && !completionAcknowledged) {
      // Always show name entry modal to allow name entry/update and resubmission
      setShowNameEntry(true);
      // Mark as completed to prevent replay
      setIsCompleted(true);
    }
  }, [isComplete, completionAcknowledged]);

  const handleNameSubmit = () => {
    setShowNameEntry(false);
    setCompletionAcknowledged(true);
  };

  const handleNameSkip = () => {
    setShowNameEntry(false);
    setCompletionAcknowledged(true);
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'extreme'];

  const handleStartDaily = async () => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const response = await api.getDailyPuzzle(selectedDifficulty, undefined, deviceId);
      
      // Check if already completed
      if (response.isCompleted) {
        setIsCompleted(true);
        setShowSelector(false);
        setLoading(false);
        return;
      }
      
      loadPuzzle(response.puzzle);
      setStreak(response.streak);
      setIsCompleted(false);
      // Don't start game automatically - wait for "I'm Ready" button
      setShowSelector(false);
    } catch (error) {
      console.error('Error loading daily puzzle:', error);
      alert('Failed to load daily puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeDifficulty = () => {
    resetGame();
    setShowSelector(true);
    setCompletionAcknowledged(false);
    setShowNameEntry(false);
    setIsCompleted(false);
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading today's puzzle...</div>
      </div>
    );
  }

  if (!puzzle || showSelector) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>📅 Daily Challenge</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className={styles.subtitle}>🔥 Current Streak: {streak.currentStreak} days</p>
        </div>

        <div className={styles.difficultySelector}>
          <label className={styles.difficultyLabel}>Select Today's Difficulty:</label>
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
          {isCompleted ? (
            <div className={styles.completedMessage}>
              <div className={styles.completedIcon}>✅</div>
              <div className={styles.completedText}>
                <h3>Already Completed!</h3>
                <p>You've already completed today's {selectedDifficulty} daily puzzle.</p>
                <p>Come back tomorrow for a new challenge!</p>
              </div>
              <button 
                className={styles.secondaryButton} 
                onClick={() => navigate('/leaderboard')}
                style={{ marginTop: '1rem' }}
              >
                🏆 View Leaderboard
              </button>
            </div>
          ) : (
            <button 
              className={styles.startButton} 
              onClick={handleStartDaily}
              disabled={loading}
            >
              {loading ? 'Loading...' : `Start ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Daily`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // If puzzle is completed, show completion message instead of game
  if (isCompleted && !isComplete) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>📅 Daily Challenge</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className={styles.difficultySelector}>
          <div className={styles.completedMessage}>
            <div className={styles.completedIcon}>✅</div>
            <div className={styles.completedText}>
              <h3>Already Completed!</h3>
              <p>You've already completed today's {selectedDifficulty} daily puzzle.</p>
              <p>Come back tomorrow for a new challenge!</p>
            </div>
            <button 
              className={styles.secondaryButton} 
              onClick={() => navigate('/leaderboard')}
              style={{ marginTop: '1rem' }}
            >
              🏆 View Leaderboard
            </button>
            <button 
              className={styles.secondaryButton} 
              onClick={handleChangeDifficulty}
              style={{ marginTop: '0.5rem' }}
            >
              ← Try Another Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>📅 Daily - {puzzle.difficulty}</h1>
        <p className={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className={styles.subtitle} style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
          Puzzle: {puzzle.seed || `${puzzle.mode}-${puzzle.difficulty}`}
        </p>
        <button 
          className={styles.secondaryButton}
          onClick={handleChangeDifficulty}
          style={{ marginTop: '1rem' }}
        >
          ← Change Difficulty
        </button>
        
        {streak.currentStreak > 0 && (
          <div className={styles.streakInfo}>
            <div>🔥 Current Streak</div>
            <div className={styles.streakNumber}>{streak.currentStreak}</div>
            <div>days</div>
          </div>
        )}
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
            <h2 className={styles.modalTitle}>🎉 Daily Puzzle Complete!</h2>
            <p className={styles.modalStats}>
              Come back tomorrow for a new puzzle!
              <br />
              🔥 Streak: {streak.currentStreak + 1} days
            </p>
            <div className={styles.modalButtons}>
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

