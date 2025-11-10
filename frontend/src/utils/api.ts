/**
 * API Client
 * Handles communication with backend
 */

import type { Puzzle, Difficulty, GameMode, Attempt, Stats, LeaderboardEntry } from '../types';

const API_BASE = '/api';

class ApiClient {
  /**
   * Get puzzle
   */
  async getPuzzle(mode: GameMode, difficulty: Difficulty): Promise<Puzzle> {
    const response = await fetch(`${API_BASE}/puzzles?mode=${mode}&difficulty=${difficulty}`);
    if (!response.ok) throw new Error('Failed to fetch puzzle');
    return response.json();
  }

  /**
   * Get daily puzzle for a specific difficulty
   */
  async getDailyPuzzle(difficulty: Difficulty, userId?: string, deviceId?: string): Promise<{ puzzle: Puzzle; streak: any; isCompleted: boolean }> {
    const params = new URLSearchParams();
    params.append('difficulty', difficulty);
    if (userId) params.append('userId', userId);
    if (deviceId) params.append('deviceId', deviceId);
    
    const response = await fetch(`${API_BASE}/daily?${params}`);
    if (!response.ok) throw new Error('Failed to fetch daily puzzle');
    return response.json();
  }

  /**
   * Create attempt
   */
  async createAttempt(data: Partial<Attempt> & { puzzleId: string; deviceId?: string }): Promise<Attempt> {
    const response = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create attempt');
    return response.json();
  }

  /**
   * Update attempt
   */
  async updateAttempt(id: string, data: Partial<Attempt>): Promise<Attempt> {
    const response = await fetch(`${API_BASE}/attempts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update attempt');
    return response.json();
  }

  /**
   * Sync attempts
   */
  async syncAttempts(attempts: Attempt[], userId?: string, deviceId?: string): Promise<Attempt[]> {
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempts, userId, deviceId })
    });
    if (!response.ok) throw new Error('Failed to sync attempts');
    const data = await response.json();
    return data.attempts;
  }

  /**
   * Get stats
   */
  async getStats(userId?: string, deviceId?: string): Promise<Stats> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (deviceId) params.append('deviceId', deviceId);
    
    const response = await fetch(`${API_BASE}/stats?${params}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }

  /**
   * Get leaderboard for a specific puzzle
   */
  async getLeaderboard(puzzleId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE}/leaderboard?puzzleId=${puzzleId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }

  /**
   * Get global leaderboard for a mode and difficulty
   */
  async getGlobalLeaderboard(mode: GameMode, difficulty: Difficulty, limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE}/leaderboard/global?mode=${mode}&difficulty=${difficulty}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch global leaderboard');
    return response.json();
  }

  /**
   * Validate puzzle solution
   */
  async validateSolution(puzzleId: string, board: number[][]): Promise<boolean> {
    const response = await fetch(`${API_BASE}/puzzles/${puzzleId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board })
    });
    if (!response.ok) throw new Error('Failed to validate solution');
    const data = await response.json();
    return data.valid;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }
}

export const api = new ApiClient();

