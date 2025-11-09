/**
 * Sync Service
 * Handles background syncing of local data to server
 */

import { api } from './api';
import { getSyncQueue, clearSyncQueue, queueAttempt, getDeviceId } from './localStorage';

class SyncService {
  private syncInterval: number | null = null;
  private isSyncing = false;

  /**
   * Start automatic sync
   */
  start(intervalMs: number = 60000): void {
    if (this.syncInterval) return;

    // Initial sync
    this.sync();

    // Periodic sync
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);

    // Sync when coming back online
    window.addEventListener('online', () => this.sync());
  }

  /**
   * Stop automatic sync
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform sync
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;

    try {
      const queue = getSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      const deviceId = getDeviceId();
      const syncedAttempts = await api.syncAttempts(queue, undefined, deviceId);

      console.log(`Synced ${syncedAttempts.length} attempts to server`);

      // Clear synced items from queue
      clearSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const syncService = new SyncService();

