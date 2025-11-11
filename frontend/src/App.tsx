/**
 * Main App Component
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { CasualGame } from './pages/CasualGame';
import { DailyGame } from './pages/DailyGame';
import { ChallengeGame } from './pages/ChallengeGame';
import { SpeedModePage } from './pages/SpeedModePage';
import { SettingsPage } from './pages/SettingsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { useGameStore } from './store/gameStore';
import { syncService } from './utils/syncService';
import './styles/globals.css';

function App() {
  const { settings } = useGameStore();

  useEffect(() => {
    // Set initial theme
    // If colorblind mode is enabled but theme is not a colorblind theme, switch to first colorblind theme
    const colorblindThemes = ['colorblind-blue', 'colorblind-high-contrast', 'colorblind-yellow', 'colorblind-monochrome'];
    let theme = settings.theme;
    
    if (settings.colorblindMode && !colorblindThemes.includes(theme)) {
      theme = 'colorblind-blue';
      // Update settings if needed
      if (settings.theme !== theme) {
        // This will be handled by the store update
      }
    } else if (!settings.colorblindMode && colorblindThemes.includes(theme)) {
      theme = 'classic';
    }
    
    document.documentElement.setAttribute('data-theme', theme);

    // Start sync service
    syncService.start();

    return () => {
      syncService.stop();
    };
  }, []);

  useEffect(() => {
    // Update theme when it changes
    // Ensure theme matches colorblind mode setting
    const colorblindThemes = ['colorblind-blue', 'colorblind-high-contrast', 'colorblind-yellow', 'colorblind-monochrome'];
    let theme = settings.theme;
    
    if (settings.colorblindMode && !colorblindThemes.includes(theme)) {
      theme = 'colorblind-blue';
    } else if (!settings.colorblindMode && colorblindThemes.includes(theme)) {
      theme = 'classic';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme, settings.colorblindMode]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casual" element={<CasualGame />} />
        <Route path="/daily" element={<DailyGame />} />
        <Route path="/challenge" element={<ChallengeGame />} />
        <Route path="/speed" element={<SpeedModePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

