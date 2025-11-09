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
import { getDeviceId, getStoredName } from '../utils/localStorage';
import styles from './GamePage.module.css';

export const DailyGame: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ currentStreak: 0, lastPlayedDate: null });
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [completionAcknowledged, setCompletionAcknowledged] = useState(false);
  const { loadPuzzle, startGame, isComplete } = useGameStore();

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  // Show name entry modal when puzzle is completed
  useEffect(() => {
    if (isComplete && !completionAcknowledged) {
      const storedName = getStoredName();
      if (!storedName) {
        setShowNameEntry(true);
      }
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

  const loadDailyPuzzle = async () => {
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const response = await api.getDailyPuzzle(undefined, deviceId);
      loadPuzzle(response.puzzle);
      setStreak(response.streak);
      startGame();
    } catch (error) {
      console.error('Error loading daily puzzle:', error);
      alert('Failed to load daily puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.gamePage}>
        <div className={styles.loading}>Loading today's puzzle...</div>
      </div>
    );
  }

  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>📅 Daily Puzzle</h1>
        <p className={styles.subtitle}>{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        
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

