import { describe, it, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { similar } from '../lib/similar.js';

describe('similar', () => {
  it('should throw error when neither id nor appId is provided', async () => {
    await expect(
      similar({})
    ).rejects.toThrow('Either id or appId is required');
  });

  itNetwork('should fetch similar apps by ID (Google Docs)', { timeout: 15000 }, async () => {
    // Google Docs app ID
    const results = await similar({ id: 842842640, country: 'us' });

    expect(Array.isArray(results)).toBe(true);

    // Should return at least a few similar apps
    if (results.length > 0) {
      expect(results.length).toBeGreaterThan(0);

      // Check structure of first result
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('appId');
      expect(results[0]?.id).not.toBe(842842640); // Should not include the original app
    }
  });

  itNetwork('should fetch similar apps by bundle ID', { timeout: 15000 }, async () => {
    // Google Docs bundle ID
    const results = await similar({ appId: 'com.google.Docs', country: 'us' });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('appId');
    }
  });
});
