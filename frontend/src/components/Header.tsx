/**
 * Header Component
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getDeviceId, getStoredName } from '../utils/localStorage';
import styles from './Header.module.css';
import type { Theme } from '../types';

export const Header: React.FC = () => {
  const location = useLocation();
  const { settings, updateSettings } = useGameStore();
  const [showDeviceId, setShowDeviceId] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [displayName, setDisplayName] = useState('');

  const normalThemes: Theme[] = ['classic', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'lavender', 'autumn'];
  const colorblindThemes: Theme[] = ['colorblind-blue', 'colorblind-high-contrast', 'colorblind-yellow', 'colorblind-monochrome', 'colorblind-dark-blue', 'colorblind-dark-yellow', 'colorblind-dark-monochrome', 'colorblind-sepia'];

  // Check for ?showid=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showId = params.get('showid') === 'true';
    setShowDeviceId(showId);

    if (showId) {
      setDeviceId(getDeviceId());
      setDisplayName(getStoredName() || 'Anonymous');
      console.log('🔍 Debug mode: Showing Device ID');
    }
  }, [location]);

  const cycleTheme = () => {
    // Get appropriate theme list based on colorblind mode
    const availableThemes = settings.colorblindMode ? colorblindThemes : normalThemes;
    
    // Find current theme in available themes, or default to first
    let currentIndex = availableThemes.indexOf(settings.theme as Theme);
    if (currentIndex === -1) {
      // Current theme not in available list, use first theme
      currentIndex = 0;
    }
    
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];
    
    updateSettings({ theme: nextTheme });
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>🧩 Sudoku Mastery</h1>
          {showDeviceId && (
            <div className={styles.debugInfo}>
              <div className={styles.debugLabel}>🔍 Debug Info:</div>
              <div className={styles.debugItem}>
                <strong>Name:</strong> {displayName}
              </div>
              <div className={styles.debugItem}>
                <strong>Device ID:</strong> <code>{deviceId}</code>
              </div>
            </div>
          )}
        </div>
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
          <span
            className={`${styles.navLink} ${styles.comingSoon}`}
            title="Speed Mode - Coming Soon"
          >
            ⚡ Speed
          </span>
          <Link
            to="/settings"
            className={`${styles.navLink} ${isActive('/settings') ? styles.active : ''}`}
          >
            ⚙️ Settings
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
            title={settings.colorblindMode ? 'Colorblind mode enabled - theme locked' : 'Change theme'}
          >
            🎨 Theme
          </button>
        </nav>
      </div>
    </header>
  );
};

