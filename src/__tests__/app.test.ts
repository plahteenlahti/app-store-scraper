import { describe, it, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { app } from '../lib/app.js';

describe('app', () => {
  it('should throw error when neither id nor appId is provided', async () => {
    await expect(
      app({})
    ).rejects.toThrow('Either id or appId is required');
  });

  itNetwork('should fetch app by numeric ID', { timeout: 10000 }, async () => {
    // Minecraft app ID
    const result = await app({ id: 479516143 });

    expect(result).toBeDefined();
    expect(result.id).toBe(479516143);
    expect(result.title).toBeDefined();
    expect(result.appId).toBeDefined();
    expect(result.developer).toBeDefined();
    expect(result.url).toBeDefined();
  });

  itNetwork('should fetch app by bundle ID', { timeout: 10000 }, async () => {
    // Minecraft bundle ID
    const result = await app({ appId: 'com.mojang.minecraftpe' });

    expect(result).toBeDefined();
    expect(result.appId).toBe('com.mojang.minecraftpe');
    expect(result.title).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.developer).toBeDefined();
  });

  itNetwork('should include ratings when ratings option is true', { timeout: 10000 }, async () => {
    const result = await app({ id: 479516143, ratings: true });

    expect(result).toBeDefined();
    expect(result.histogram).toBeDefined();
    expect(typeof result.histogram).toBe('object');
  });
});
