import { describe, it, expect } from 'vitest';
import { reviews, parseReviews } from '../lib/reviews.js';

// Trimmed capture of the customer-reviews XML (Atom) feed. The first <entry> is
// app metadata with no im:rating and must be filtered out; the following two
// are real reviews.
const REVIEWS_XML_FIXTURE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns:im="http://itunes.apple.com/rss" xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <id>https://itunes.apple.com/us/rss/customerreviews/id=1465439395/xml</id>
  <title>iTunes Store: Customer Reviews</title>
  <entry>
    <updated>2026-08-12T00:00:00-07:00</updated>
    <id>1465439395</id>
    <im:name>Dark Noise</im:name>
    <title>Dark Noise</title>
    <content type="text"></content>
  </entry>
  <entry>
    <updated>2026-07-15T16:06:18-07:00</updated>
    <id>14307969504</id>
    <title>Too expensive</title>
    <content type="text">There is no world in which a noise app should cost this much.</content>
    <content type="html">&lt;p&gt;ignored&lt;/p&gt;</content>
    <im:voteSum>2</im:voteSum>
    <im:voteCount>3</im:voteCount>
    <im:rating>2</im:rating>
    <im:version>3.5.2</im:version>
    <author>
      <name>dtxvsk</name>
      <uri>https://itunes.apple.com/us/reviews/id75018210</uri>
    </author>
  </entry>
  <entry>
    <updated>2026-07-10T09:00:00-07:00</updated>
    <id>14300000001</id>
    <title>Love it</title>
    <content type="text">Best white noise app on iOS.</content>
    <im:voteSum>0</im:voteSum>
    <im:voteCount>0</im:voteCount>
    <im:rating>5</im:rating>
    <im:version>3.5.1</im:version>
    <author>
      <name>sleepyhead</name>
      <uri>https://itunes.apple.com/us/reviews/id99999999</uri>
    </author>
  </entry>
</feed>`;

describe('reviews', () => {
  it('should throw when neither id nor appId is provided', async () => {
    await expect(reviews({})).rejects.toThrow('Either id or appId is required');
  });

  it('should throw when page is out of range', async () => {
    await expect(reviews({ id: 1465439395, page: 0 })).rejects.toThrow(
      'Page must be between 1 and 10'
    );
    await expect(reviews({ id: 1465439395, page: 11 })).rejects.toThrow(
      'Page must be between 1 and 10'
    );
  });

  describe('parseReviews (fixture)', () => {
    it('filters out the metadata entry and keeps only rated reviews', () => {
      const result = parseReviews(REVIEWS_XML_FIXTURE);
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.score >= 1 && r.score <= 5)).toBe(true);
    });

    it('extracts every field from an XML review entry', () => {
      const [first] = parseReviews(REVIEWS_XML_FIXTURE);
      expect(first).toEqual({
        id: '14307969504',
        userName: 'dtxvsk',
        userUrl: 'https://itunes.apple.com/us/reviews/id75018210',
        version: '3.5.2',
        score: 2,
        title: 'Too expensive',
        text: 'There is no world in which a noise app should cost this much.',
        updated: '2026-07-15T16:06:18-07:00',
        voteSum: 2,
        voteCount: 3,
      });
    });
  });

  it('fetches live reviews for a real app (Dark Noise)', { timeout: 15000 }, async () => {
    // Apple aggressively rate-limits this feed, so tolerate an empty response;
    // when reviews come back, their shape must be correct.
    const results = await reviews({ id: 1465439395, page: 1 });
    expect(Array.isArray(results)).toBe(true);
    results.forEach((review) => {
      expect(typeof review.id).toBe('string');
      expect(review.score).toBeGreaterThanOrEqual(1);
      expect(review.score).toBeLessThanOrEqual(5);
      expect(typeof review.userName).toBe('string');
      expect(typeof review.voteCount).toBe('number');
    });
  });
});
