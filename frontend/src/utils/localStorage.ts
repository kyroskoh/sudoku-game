/**
 * LocalStorage utilities
 * Manages local persistence of game state
 */

import type { Settings, Stats, Attempt } from '../types';
import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  DEVICE_ID: 'sudoku.deviceId',
  SETTINGS: 'sudoku.settings',
  PROGRESS: 'sudoku.progress',
  STATS: 'sudoku.stats',
  QUEUE: 'sudoku.queue',
  DISPLAY_NAME: 'sudoku.displayName'
};

/**
 * Get or create device ID
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

/**
 * Get settings
 */
export function getSettings(): Settings {
  const stored = localStorage.getItem(KEYS.SETTINGS);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    theme: 'classic',
    showMistakes: true,
    autoNoteClear: true,
    highlightDuplicates: true,
    highlightRowCol: true,
    soundEnabled: false,
    colorblindMode: false
  };
}

/**
 * Save settings
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Get progress for a puzzle
 */
export function getProgress(puzzleId: string): any | null {
  const stored = localStorage.getItem(KEYS.PROGRESS);
  if (!stored) return null;
  
  const progress = JSON.parse(stored);
  return progress[puzzleId] || null;
}

/**
 * Save progress for a puzzle
 */
export function saveProgress(puzzleId: string, data: any): void {
  const stored = localStorage.getItem(KEYS.PROGRESS);
  const progress = stored ? JSON.parse(stored) : {};
  
  progress[puzzleId] = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

/**
 * Clear progress for a puzzle
 */
export function clearProgress(puzzleId: string): void {
  const stored = localStorage.getItem(KEYS.PROGRESS);
  if (!stored) return;
  
  const progress = JSON.parse(stored);
  delete progress[puzzleId];
  
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

/**
 * Get stats
 */
export function getStats(): Stats {
  const stored = localStorage.getItem(KEYS.STATS);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalCompleted: 0,
    byMode: {},
    byDifficulty: {},
    bestTimes: {}
  };
}

/**
 * Save stats
 */
export function saveStats(stats: Stats): void {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
}

/**
 * Add attempt to sync queue
 */
export function queueAttempt(attempt: Attempt): void {
  const stored = localStorage.getItem(KEYS.QUEUE);
  const queue = stored ? JSON.parse(stored) : [];
  
  // Check if attempt already in queue
  const index = queue.findIndex((a: Attempt) => a.id === attempt.id);
  if (index >= 0) {
    queue[index] = attempt;
  } else {
    queue.push(attempt);
  }
  
  localStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
}

/**
 * Get sync queue
 */
export function getSyncQueue(): Attempt[] {
  const stored = localStorage.getItem(KEYS.QUEUE);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Clear sync queue
 */
export function clearSyncQueue(): void {
  localStorage.setItem(KEYS.QUEUE, JSON.stringify([]));
}

/**
 * Serialize notes board for storage
 */
export function serializeNotes(notes: Set<number>[][]): number[][][] {
  return notes.map(row => row.map(cell => Array.from(cell)));
}

/**
 * Deserialize notes board from storage
 */
export function deserializeNotes(notes: number[][][]): Set<number>[][] {
  return notes.map(row => row.map(cell => new Set(cell)));
}

/**
 * Get stored display name
 */
export function getStoredName(): string | null {
  return localStorage.getItem(KEYS.DISPLAY_NAME);
}

/**
 * Store display name
 */
export function storeName(name: string): void {
  localStorage.setItem(KEYS.DISPLAY_NAME, name);
}

/**
 * Clear display name
 */
export function clearName(): void {
  localStorage.removeItem(KEYS.DISPLAY_NAME);
}

