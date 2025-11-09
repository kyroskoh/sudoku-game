/**
 * Header Component
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from './Header.module.css';
import type { Theme } from '../types';

export const Header: React.FC = () => {
  const location = useLocation();
  const { settings, updateSettings } = useGameStore();

  const themes: Theme[] = ['classic', 'dark', 'ocean', 'forest'];

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateSettings({ theme: themes[nextIndex] });
    document.documentElement.setAttribute('data-theme', themes[nextIndex]);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>🧩 Sudoku Mastery</h1>
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Home
          </Link>
          <Link
            to="/casual"
            className={`${styles.navLink} ${isActive('/casual') ? styles.active : ''}`}
          >
            Casual
          </Link>
          <Link
            to="/daily"
            className={`${styles.navLink} ${isActive('/daily') ? styles.active : ''}`}
          >
            Daily
          </Link>
          <Link
            to="/challenge"
            className={`${styles.navLink} ${isActive('/challenge') ? styles.active : ''}`}
          >
            Challenge
          </Link>
          <Link
            to="/leaderboard"
            className={`${styles.navLink} ${isActive('/leaderboard') ? styles.active : ''}`}
          >
            🏆 Leaderboard
          </Link>
          <button
            className={styles.themeButton}
            onClick={cycleTheme}
            aria-label="Change theme"
          >
            🎨 Theme
          </button>
        </nav>
      </div>
    </header>
  );
};

