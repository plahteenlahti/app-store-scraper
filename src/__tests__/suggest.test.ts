import { describe, it, expect } from 'vitest';
import { suggest } from '../lib/suggest.js';

describe('suggest', () => {
  it('should throw error when term is missing', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      suggest({})
    ).rejects.toThrow('term is required');
  });

  it('should return autocomplete suggestions for a term', { timeout: 10000 }, async () => {
    const results = await suggest({ term: 'insta' });

    expect(Array.isArray(results)).toBe(true);
    // Apple's hints endpoint returns nothing without a storefront header, so a
    // non-empty result confirms the X-Apple-Store-Front header is being sent.
    expect(results.length).toBeGreaterThan(0);

    results.forEach((suggestion) => {
      expect(suggestion).toHaveProperty('term');
      expect(typeof suggestion.term).toBe('string');
      expect(suggestion.term.length).toBeGreaterThan(0);
    });
  });

  it('should return suggestions for the requested country storefront', { timeout: 10000 }, async () => {
    const results = await suggest({ term: 'wetter', country: 'de' });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
