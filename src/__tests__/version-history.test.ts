import { describe, it, expect } from 'vitest';
import { versionHistory } from '../lib/version-history.js';

describe('versionHistory', () => {
  it('should throw error when id is missing', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      versionHistory({})
    ).rejects.toThrow('id is required');
  });

  it('should fetch version history for an app (Minecraft)', { timeout: 15000 }, async () => {
    const results = await versionHistory({ id: 479516143 });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    results.forEach((entry) => {
      // Version label is present (e.g. "26.40")
      expect(entry).toHaveProperty('versionDisplay');
      expect(typeof entry.versionDisplay).toBe('string');
      expect(entry.versionDisplay.length).toBeGreaterThan(0);

      // Release date is an ISO calendar date (YYYY-MM-DD)
      expect(entry.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should include release notes when available (Instagram)', { timeout: 15000 }, async () => {
    const results = await versionHistory({ id: 389801252 });

    expect(results.length).toBeGreaterThan(0);
    const withNotes = results.filter((entry) => (entry.releaseNotes?.length ?? 0) > 0);
    expect(withNotes.length).toBeGreaterThan(0);
  });
});
