import { describe, it, expect, vi, afterEach } from 'vitest';
import { itNetwork } from './helpers.js';
import { list } from '../lib/list.js';
import { collection } from '../types/constants.js';

/** A minimal but realistic RSS chart feed entry. */
const sampleEntry = {
  'im:name': { label: 'Example App' },
  'im:image': [
    { label: 'https://example.test/icon/53x53bb.png', attributes: { height: '53' } },
    { label: 'https://example.test/icon/100x100bb.png', attributes: { height: '100' } },
    { label: 'https://example.test/icon/75x75bb.png', attributes: { height: '75' } },
  ],
  summary: { label: 'A short summary.' },
  'im:price': { label: 'Get', attributes: { amount: '0.00', currency: 'USD' } },
  title: { label: 'Example App - Example Ltd.' },
  id: {
    label: 'https://apps.apple.com/us/app/example-app/id123456789?uo=2',
    attributes: { 'im:id': '123456789', 'im:bundleId': 'com.example.app' },
  },
  'im:artist': {
    label: 'Example Ltd.',
    attributes: { href: 'https://apps.apple.com/us/developer/example-ltd/id987654321?uo=2' },
  },
  category: {
    attributes: { 'im:id': '6016', term: 'Entertainment', label: 'Entertainment' },
  },
  'im:releaseDate': { label: '2026-06-03T00:00:00-07:00' },
};

const paidEntry = {
  ...sampleEntry,
  'im:price': { label: '$1.99', attributes: { amount: '1.99', currency: 'USD' } },
  id: {
    label: 'https://apps.apple.com/us/app/paid-app/id222?uo=2',
    attributes: { 'im:id': '222', 'im:bundleId': 'com.example.paid' },
  },
};

/** Stubs the global fetch to return a canned RSS feed, and returns the spy. */
function stubFeed(entry: unknown) {
  const impl = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({ feed: { entry } }), { status: 200 }))
  );
  vi.stubGlobal('fetch', impl);
  return impl;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('list', () => {
  it('parses lightweight ListApp records when fullDetail is false', async () => {
    stubFeed([sampleEntry, paidEntry]);

    const results = await list({ collection: collection.TOP_FREE_IOS, fullDetail: false });

    expect(results).toHaveLength(2);
    const [app] = results;
    expect(app).toEqual({
      id: 123456789,
      appId: 'com.example.app',
      title: 'Example App',
      icon: 'https://example.test/icon/100x100bb.png', // largest by height
      url: 'https://apps.apple.com/us/app/example-app/id123456789?uo=2',
      price: 0,
      currency: 'USD',
      free: true,
      description: 'A short summary.',
      developer: 'Example Ltd.',
      developerUrl: 'https://apps.apple.com/us/developer/example-ltd/id987654321?uo=2',
      developerId: 987654321,
      genre: 'Entertainment',
      genreId: '6016',
      released: '2026-06-03T00:00:00-07:00',
    });
  });

  it('marks paid apps as not free and parses the price', async () => {
    stubFeed([paidEntry]);
    const results = await list({ fullDetail: false });
    expect(results[0]!.price).toBe(1.99);
    expect(results[0]!.free).toBe(false);
  });

  it('handles a single-entry feed returned as an object, not an array', async () => {
    stubFeed(sampleEntry);
    const results = await list({ fullDetail: false });
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe(123456789);
  });

  it('returns an empty array for an empty feed', async () => {
    stubFeed(undefined);
    const results = await list({ fullDetail: false });
    expect(results).toEqual([]);
  });

  it('does not issue a lookup request on the lightweight path', async () => {
    const impl = stubFeed([sampleEntry]);
    await list({ fullDetail: false });
    // A single request (the feed) — no follow-up lookup.
    expect(impl).toHaveBeenCalledTimes(1);
  });

  // Network smoke tests — exercise the real endpoints like the other suites.
  itNetwork('returns full App objects by default', { timeout: 15000 }, async () => {
    const results = await list({ collection: collection.TOP_FREE_IOS, num: 3 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const app = results[0]!;
    // Full App carries fields the lightweight feed does not.
    expect(app).toHaveProperty('id');
    expect(app).toHaveProperty('version');
    expect(app).toHaveProperty('screenshots');
  });

  itNetwork('returns lightweight results with fullDetail false against the real feed', { timeout: 15000 }, async () => {
    const results = await list({
      collection: collection.TOP_FREE_IOS,
      num: 3,
      fullDetail: false,
    });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const app = results[0]!;
    expect(app).toHaveProperty('id');
    expect(app).toHaveProperty('title');
    expect(app).toHaveProperty('developer');
    expect(typeof app.id).toBe('number');
  });
});
