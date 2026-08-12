import { describe, it, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { ratings, parseRatings } from '../lib/ratings.js';

// Captured from the customer-reviews endpoint (Dark Noise). The total count is
// rendered with a thousands separator, which is exactly what the parser must
// handle correctly.
const RATINGS_HTML_FIXTURE = `
<html><body>
  <div class="rating-count">3,624 Ratings</div>
  <div class="vote" aria-label="5 stars, 3,244 ratings"><span class="total">3244</span></div>
  <div class="vote" aria-label="4 stars, 212 ratings"><span class="total">212</span></div>
  <div class="vote" aria-label="3 stars, 62 ratings"><span class="total">62</span></div>
  <div class="vote" aria-label="2 stars, 25 ratings"><span class="total">25</span></div>
  <div class="vote" aria-label="1 star, 81 ratings"><span class="total">81</span></div>
</body></html>`;

describe('ratings', () => {
  it('should throw when id is missing', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      ratings({})
    ).rejects.toThrow('id is required');
  });

  describe('parseRatings (fixture)', () => {
    it('parses the full count past thousands separators', () => {
      // Regression: a naive /\d+/ match stops at the first comma and returns 3
      // instead of 3624 for a "3,624 Ratings" label.
      const result = parseRatings(RATINGS_HTML_FIXTURE);
      expect(result.ratings).toBe(3624);
    });

    it('maps the star buckets from 5 down to 1', () => {
      const result = parseRatings(RATINGS_HTML_FIXTURE);
      expect(result.histogram).toEqual({ 1: 81, 2: 25, 3: 62, 4: 212, 5: 3244 });
      // The histogram accounts for exactly the reported total.
      const sum = (Object.values(result.histogram) as number[]).reduce((a, b) => a + b, 0);
      expect(sum).toBe(result.ratings);
    });
  });

  itNetwork('fetches a live histogram for a real app (Dark Noise)', { timeout: 15000 }, async () => {
    const result = await ratings({ id: 1465439395 });
    expect(typeof result.ratings).toBe('number');
    ([1, 2, 3, 4, 5] as const).forEach((star) => {
      expect(typeof result.histogram[star]).toBe('number');
      expect(result.histogram[star]).toBeGreaterThanOrEqual(0);
    });
  });
});
