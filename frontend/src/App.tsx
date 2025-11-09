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
import { LeaderboardPage } from './pages/LeaderboardPage';
import { useGameStore } from './store/gameStore';
import { syncService } from './utils/syncService';
import './styles/globals.css';

function App() {
  const { settings } = useGameStore();

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', settings.theme);

    // Start sync service
    syncService.start();

    return () => {
      syncService.stop();
    };
  }, []);

  useEffect(() => {
    // Update theme when it changes
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casual" element={<CasualGame />} />
        <Route path="/daily" element={<DailyGame />} />
        <Route path="/challenge" element={<ChallengeGame />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

