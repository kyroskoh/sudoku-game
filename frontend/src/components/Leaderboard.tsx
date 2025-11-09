/**
 * Leaderboard Component
 */

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { GameMode, Difficulty, LeaderboardEntry } from '../types';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  mode?: GameMode;
  difficulty?: Difficulty;
  puzzleId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  mode: initialMode = 'daily', 
  difficulty: initialDifficulty = 'easy',
  puzzleId 
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [mode, difficulty, puzzleId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      if (puzzleId) {
        // Specific puzzle leaderboard
        const data = await api.getLeaderboard(puzzleId);
        setEntries(data);
      } else {
        // Global leaderboard for mode/difficulty
        const data = await api.getGlobalLeaderboard(mode, difficulty);
        setEntries(data);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRankClass = (rank: number): string => {
    if (rank === 1) return styles.gold;
    if (rank === 2) return styles.silver;
    if (rank === 3) return styles.bronze;
    return '';
  };

  return (
    <div className={styles.leaderboard}>
      <h2 className={styles.title}>🏆 Leaderboard</h2>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Mode:</label>
          <select 
            className={styles.select} 
            value={mode} 
            onChange={(e) => setMode(e.target.value as GameMode)}
          >
            <option value="daily">Daily Puzzle</option>
            <option value="casual">Casual</option>
            <option value="challenge">Challenge</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Difficulty:</label>
          <select 
            className={styles.select} 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>Loading leaderboard...</div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className={styles.empty}>
          No entries yet. Be the first to complete a puzzle!
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Time</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td>
                  <span className={`${styles.rank} ${getRankClass(index + 1)}`}>
                    {index + 1}
                  </span>
                </td>
                <td>
                  {entry.displayName || 
                   (entry.userId ? `User ${entry.userId.slice(0, 8)}` : 
                   entry.deviceId ? `Player ${entry.deviceId.slice(0, 8)}` : 
                   'Anonymous')}
                </td>
                <td className={styles.time}>{formatTime(entry.timeMs)}</td>
                <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

