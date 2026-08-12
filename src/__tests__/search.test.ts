import { describe, it, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { search } from '../lib/search.js';

describe('search', () => {
  it('should throw error when term is missing', async () => {
    await expect(
      search({ term: '' })
    ).rejects.toThrow('term is required');
  });

  itNetwork('should search for apps with a valid term', { timeout: 10000 }, async () => {
    const results = await search({
      term: 'minecraft',
      num: 5
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);

    if (results.length > 0 && typeof results[0] === 'object') {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('appId');
    }
  });

  itNetwork('should return only IDs when idsOnly is true', { timeout: 10000 }, async () => {
    const results = await search({
      term: 'minecraft',
      num: 5,
      idsOnly: true
    });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      expect(typeof results[0]).toBe('number');
    }
  });

  itNetwork('should respect pagination', { timeout: 10000 }, async () => {
    const page1 = await search({
      term: 'game',
      num: 5,
      page: 1
    });

    const page2 = await search({
      term: 'game',
      num: 5,
      page: 2
    });

    expect(Array.isArray(page1)).toBe(true);
    expect(Array.isArray(page2)).toBe(true);

    // Pages should have different results (if there are enough results)
    if (page1.length > 0 && page2.length > 0 &&
        typeof page1[0] === 'object' && typeof page2[0] === 'object') {
      expect(page1[0].id).not.toBe(page2[0].id);
    }
  });
});
