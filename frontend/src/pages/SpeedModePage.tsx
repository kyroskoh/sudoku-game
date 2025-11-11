/**
 * Speed Mode Page - Coming Soon
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SpeedModePage.module.css';

export const SpeedModePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.speedModePage}>
      <div className={styles.container}>
        <div className={styles.icon}>⚡</div>
        <h1 className={styles.title}>Speed Mode</h1>
        <h2 className={styles.subtitle}>Coming Soon!</h2>
        
        <div className={styles.content}>
          <p className={styles.description}>
            Get ready for an adrenaline-pumping Sudoku experience! Speed Mode will challenge you to solve puzzles against the clock.
          </p>

          <div className={styles.features}>
            <h3 className={styles.featuresTitle}>What to Expect:</h3>
            <ul className={styles.featuresList}>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>⏱️</span>
                <div>
                  <strong>Time Limits</strong>
                  <p>Race against the clock with difficulty-based time limits (5-30 minutes)</p>
                </div>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🏆</span>
                <div>
                  <strong>Bonus Points</strong>
                  <p>Earn multipliers for finishing early - up to 2x points!</p>
                </div>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🔥</span>
                <div>
                  <strong>Speed Streaks</strong>
                  <p>Build consecutive speed solve streaks and unlock achievements</p>
                </div>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <div>
                  <strong>Dedicated Leaderboards</strong>
                  <p>Compete for the fastest times and highest scores</p>
                </div>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>🎯</span>
                <div>
                  <strong>Progressive Unlocks</strong>
                  <p>Unlock harder difficulties as you master each level</p>
                </div>
              </li>
              <li className={styles.feature}>
                <span className={styles.featureIcon}>💎</span>
                <div>
                  <strong>Achievements & Badges</strong>
                  <p>Unlock special badges for speed milestones and records</p>
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.backButton}
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
            <button
              className={styles.leaderboardButton}
              onClick={() => navigate('/leaderboard')}
            >
              View Leaderboard 🏆
            </button>
          </div>

          <div className={styles.roadmapLink}>
            <p>
              Want to learn more? Check out our{' '}
              <a
                href="https://github.com/kyroskoh/sudoku-game/blob/main/ROADMAP.md"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                detailed roadmap
              </a>
              {' '}for Speed Mode!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

