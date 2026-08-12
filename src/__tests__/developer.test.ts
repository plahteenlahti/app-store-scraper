import { describe, it, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { developer } from '../lib/developer.js';

describe('developer', () => {
  it('should throw error when devId is missing', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      developer({})
    ).rejects.toThrow('devId is required');
  });

  itNetwork('should fetch apps by developer ID (Google)', { timeout: 10000 }, async () => {
    // Google's developer ID
    const results = await developer({ devId: 281956209 });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // All results should be apps from Google
    results.forEach((app) => {
      expect(app.developerId).toBe(281956209);
      expect(app.developer).toBe('Google');
      expect(app).toHaveProperty('id');
      expect(app).toHaveProperty('title');
      expect(app).toHaveProperty('appId');
    });
  });

  itNetwork('should fetch apps by developer ID (Mojang)', { timeout: 10000 }, async () => {
    // Mojang's developer ID (Minecraft creator)
    const results = await developer({ devId: 479516143 });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Check that results are valid apps
    results.forEach((app) => {
      expect(app).toHaveProperty('id');
      expect(app).toHaveProperty('title');
      expect(app).toHaveProperty('appId');
      expect(app).toHaveProperty('developer');
    });
  });
});
