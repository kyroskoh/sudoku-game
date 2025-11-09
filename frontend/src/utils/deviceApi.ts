/**
 * Device API
 * Handles device registration and name updates
 */

const API_BASE = '/api';

export const deviceApi = {
  /**
   * Register or update device with displayName
   */
  async updateDevice(deviceId: string, displayName: string): Promise<void> {
    const response = await fetch(`${API_BASE}/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deviceId, displayName })
    });

    if (!response.ok) {
      throw new Error('Failed to update device');
    }
  }
};

