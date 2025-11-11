/**
 * Settings Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useGameStore();

  const normalThemes = ['classic', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'lavender', 'autumn'];
  const colorblindThemes = ['colorblind-blue', 'colorblind-high-contrast', 'colorblind-yellow', 'colorblind-monochrome', 'colorblind-dark-blue', 'colorblind-dark-yellow', 'colorblind-dark-monochrome', 'colorblind-sepia'];

  const handleColorblindModeToggle = (enabled: boolean) => {
    const isCurrentlyColorblind = colorblindThemes.includes(settings.theme as any);
    
    updateSettings({ 
      colorblindMode: enabled,
      // When enabling colorblind mode, switch to first colorblind theme if not already one
      // When disabling, switch to classic if currently on colorblind theme
      theme: enabled 
        ? (isCurrentlyColorblind ? settings.theme : 'colorblind-blue')
        : (isCurrentlyColorblind ? 'classic' : settings.theme)
    });
    
    // Update theme attribute immediately
    const newTheme = enabled 
      ? (isCurrentlyColorblind ? settings.theme : 'colorblind-blue')
      : (isCurrentlyColorblind ? 'classic' : settings.theme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleThemeChange = (theme: string) => {
    // Only allow themes that match the current colorblind mode setting
    const isColorblindTheme = colorblindThemes.includes(theme);
    if (settings.colorblindMode && !isColorblindTheme) {
      return; // Don't allow non-colorblind themes when colorblind mode is enabled
    }
    if (!settings.colorblindMode && isColorblindTheme) {
      return; // Don't allow colorblind themes when colorblind mode is disabled
    }
    
    updateSettings({ theme: theme as any });
    document.documentElement.setAttribute('data-theme', theme);
  };

  const getAvailableThemes = () => {
    return settings.colorblindMode ? colorblindThemes : normalThemes;
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className={styles.title}>⚙️ Settings</h1>
        </div>

        <div className={styles.sections}>
          {/* Accessibility Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>♿ Accessibility</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="colorblind-mode" className={styles.settingLabel}>
                  Colorblind Mode
                </label>
                <p className={styles.settingDescription}>
                  Enable colorblind-friendly themes. When enabled, only colorblind-optimized themes will be available.
                </p>
              </div>
              <div className={styles.settingControl}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    id="colorblind-mode"
                    checked={settings.colorblindMode}
                    onChange={(e) => handleColorblindModeToggle(e.target.checked)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎨 Appearance</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Theme</label>
                <p className={styles.settingDescription}>
                  {settings.colorblindMode 
                    ? 'Choose from colorblind-friendly themes optimized for accessibility.'
                    : 'Choose your preferred color theme.'}
                </p>
              </div>
              <div className={styles.settingControl}>
                <div className={styles.themeSelector}>
                  {getAvailableThemes().map((theme) => {
                    const themeLabels: Record<string, string> = {
                      'classic': 'Classic',
                      'dark': 'Dark',
                      'ocean': 'Ocean',
                      'forest': 'Forest',
                      'sunset': 'Sunset',
                      'midnight': 'Midnight',
                      'lavender': 'Lavender',
                      'autumn': 'Autumn',
                      'colorblind-blue': 'Blue-Orange',
                      'colorblind-high-contrast': 'High Contrast',
                      'colorblind-yellow': 'Blue-Yellow',
                      'colorblind-monochrome': 'Monochrome',
                      'colorblind-dark-blue': 'Dark Blue',
                      'colorblind-dark-yellow': 'Dark Yellow',
                      'colorblind-dark-monochrome': 'Dark Mono',
                      'colorblind-sepia': 'Sepia'
                    };
                    
                    return (
                      <button
                        key={theme}
                        className={`${styles.themeButton} ${
                          settings.theme === theme ? styles.themeButtonActive : ''
                        }`}
                        onClick={() => handleThemeChange(theme)}
                        title={themeLabels[theme] || theme}
                      >
                        {themeLabels[theme] || theme}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Game Settings Section (Placeholder for future use) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎮 Game Settings</h2>
            <p className={styles.comingSoon}>More settings coming soon...</p>
          </section>
        </div>
      </div>
    </div>
  );
};

