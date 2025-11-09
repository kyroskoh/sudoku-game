/**
 * Home Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const modes = [
    {
      icon: '🎮',
      title: 'Casual Mode',
      description: 'Practice with progressive difficulty levels. Perfect for honing your skills!',
      path: '/casual'
    },
    {
      icon: '📅',
      title: 'Daily Puzzle',
      description: 'One puzzle per day. Build your streak and compete on the leaderboard!',
      path: '/daily'
    },
    {
      icon: '🏆',
      title: 'Challenge Mode',
      description: 'Test your limits with timed puzzles and special constraints!',
      path: '/challenge'
    }
  ];

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to Sudoku Mastery</h1>
        <p className={styles.subtitle}>Classic Sudoku with modern features</p>
      </div>

      <div className={styles.modes}>
        {modes.map((mode) => (
          <div
            key={mode.path}
            className={styles.modeCard}
            onClick={() => navigate(mode.path)}
          >
            <div className={styles.modeIcon}>{mode.icon}</div>
            <h2 className={styles.modeTitle}>{mode.title}</h2>
            <p className={styles.modeDescription}>{mode.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.features}>
        <h2 className={styles.featuresTitle}>Features</h2>
        <ul className={styles.featureList}>
          <li className={styles.feature}>✏️ Pen & Pencil Modes</li>
          <li className={styles.feature}>↶ Undo/Redo Support</li>
          <li className={styles.feature}>💡 Smart Hints</li>
          <li className={styles.feature}>🎨 Multiple Themes</li>
          <li className={styles.feature}>⏱️ Timer & Stats</li>
          <li className={styles.feature}>📱 Responsive Design</li>
          <li className={styles.feature}>💾 Auto-Save Progress</li>
          <li className={styles.feature}>🌐 Offline Support</li>
        </ul>
      </div>
    </div>
  );
};

