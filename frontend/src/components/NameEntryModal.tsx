/**
 * Name Entry Modal Component
 * Allows users to enter their name for the leaderboard
 */

import React, { useState, useEffect } from 'react';
import { getStoredName, storeName, getDeviceId, getSyncQueue } from '../utils/localStorage';
import { deviceApi } from '../utils/deviceApi';
import { api } from '../utils/api';
import styles from './NameEntryModal.module.css';

interface NameEntryModalProps {
  isOpen: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}

export const NameEntryModal: React.FC<NameEntryModalProps> = ({ 
  isOpen, 
  onSubmit, 
  onSkip 
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [hasStoredName, setHasStoredName] = useState(false);

  useEffect(() => {
    // Pre-fill with stored name if available
    const storedName = getStoredName();
    if (storedName) {
      setName(storedName);
      setHasStoredName(true);
    } else {
      setName('');
      setHasStoredName(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter a name');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    try {
      // Store the name locally
      storeName(trimmedName);
      
      // Update device on backend
      const deviceId = getDeviceId();
      await deviceApi.updateDevice(deviceId, trimmedName);
      
      // Sync attempts to update leaderboard with new name
      try {
        const queue = getSyncQueue();
        if (queue.length > 0) {
          console.log(`[NameEntry] Syncing ${queue.length} attempt(s) to update leaderboard...`);
          const synced = await api.syncAttempts(queue, undefined, deviceId);
          console.log('✅ Attempts synced after name update:', synced);
          
          // Wait a bit for leaderboard to update
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.warn('[NameEntry] No attempts in queue to sync');
        }
      } catch (syncError) {
        console.error('[NameEntry] Error syncing attempts:', syncError);
        // Continue even if sync fails - user can refresh leaderboard manually
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving name:', error);
      // Still proceed even if backend update fails
      onSubmit();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {hasStoredName ? '✏️ Update Your Name' : '🏆 Enter Your Name'}
        </h2>
        <p className={styles.subtitle}>
          {hasStoredName 
            ? 'Update your name and resubmit to the leaderboard!'
            : 'Your score will be added to the leaderboard!'
          }
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              maxLength={20}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.buttons}>
            <button 
              type="submit" 
              className={styles.submitButton}
            >
              {hasStoredName ? 'Update & Resubmit' : 'Submit to Leaderboard'}
            </button>
            <button 
              type="button" 
              className={styles.skipButton}
              onClick={handleSkip}
            >
              Skip
            </button>
          </div>
        </form>

        <p className={styles.hint}>
          {hasStoredName 
            ? '💡 You can update your name anytime and resubmit'
            : '💡 Your name will be saved for next time'
          }
        </p>
      </div>
    </div>
  );
};

