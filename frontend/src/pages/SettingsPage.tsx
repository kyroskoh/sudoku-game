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

  const handleColorblindModeToggle = (enabled: boolean) => {
    updateSettings({ 
      colorblindMode: enabled,
      // When enabling colorblind mode, switch to colorblind theme
      // When disabling, keep current theme or switch to classic
      theme: enabled ? 'colorblind' : (settings.theme === 'colorblind' ? 'classic' : settings.theme)
    });
    // Update theme attribute immediately
    document.documentElement.setAttribute('data-theme', enabled ? 'colorblind' : (settings.theme === 'colorblind' ? 'classic' : settings.theme));
  };

  const handleThemeChange = (theme: string) => {
    // Don't allow theme change if colorblind mode is enabled
    if (settings.colorblindMode) {
      return;
    }
    updateSettings({ theme: theme as any });
    document.documentElement.setAttribute('data-theme', theme);
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
                  Enable colorblind-friendly theme. When enabled, the app will use the colorblind theme exclusively.
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
                    ? 'Colorblind mode is enabled. Theme is locked to Colorblind.'
                    : 'Choose your preferred color theme.'}
                </p>
              </div>
              <div className={styles.settingControl}>
                <div className={styles.themeSelector}>
                  {['classic', 'dark', 'ocean', 'forest', 'colorblind'].map((theme) => (
                    <button
                      key={theme}
                      className={`${styles.themeButton} ${
                        settings.theme === theme ? styles.themeButtonActive : ''
                      } ${settings.colorblindMode && theme !== 'colorblind' ? styles.themeButtonDisabled : ''}`}
                      onClick={() => handleThemeChange(theme)}
                      disabled={settings.colorblindMode && theme !== 'colorblind'}
                      title={settings.colorblindMode && theme !== 'colorblind' ? 'Disabled in colorblind mode' : theme}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
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

