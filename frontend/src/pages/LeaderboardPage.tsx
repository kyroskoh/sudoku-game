/**
 * Leaderboard Page
 */

import React from 'react';
import { Leaderboard } from '../components/Leaderboard';
import styles from './LeaderboardPage.module.css';

export const LeaderboardPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>🏆 Global Leaderboard</h1>
          <p className={styles.subtitle}>
            Compete with players worldwide and climb to the top!
          </p>
        </div>

        <Leaderboard />

        <div className={styles.info}>
          <h3>How Rankings Work</h3>
          <ul>
            <li>⏱️ Rankings are based on completion time</li>
            <li>🎯 Faster times rank higher</li>
            <li>📅 Daily puzzles have separate leaderboards</li>
            <li>🏅 Each difficulty has its own rankings</li>
            <li>🔄 Leaderboards update in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

