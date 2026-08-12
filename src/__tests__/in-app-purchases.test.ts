import { describe, it, expect, vi, afterEach } from 'vitest';
import { itNetwork } from './helpers.js';
import { inAppPurchases, parseInAppPurchases } from '../lib/in-app-purchases.js';
import { app } from '../lib/app.js';

/**
 * A trimmed-down version of the real App Store page markup: the In-App
 * Purchases block lives inside an information list keyed by a <dt> heading, with
 * each purchase as an <li> holding a title span and a price span. Deliberately
 * uses different (build-specific) class hashes than production to prove we match
 * on the heading text, not the classes.
 */
const pageWithIap = `
<html><body>
  <dl class="information-list">
    <div><dt class="svelte-abc123">Seller</dt><dd>Example Ltd.</dd></div>
    <div>
      <dt class="svelte-abc123">In-App Purchases</dt>
      <dd>
        <details>
          <summary>Yes</summary>
          <ul>
            <li class="svelte-xyz789"><div class="text-pair"><span>10 Gold Bars</span> <span>$1.99</span></div></li>
            <li class="svelte-xyz789"><div class="text-pair"><span>Extra Moves</span> <span>$0.99</span></div></li>
            <li class="svelte-xyz789"><div class="text-pair"><span>Season Pass</span> <span>$9.99</span></div></li>
          </ul>
        </details>
      </dd>
    </div>
  </dl>
</body></html>
`;

const pageWithoutIap = `
<html><body>
  <dl class="information-list">
    <div><dt>Seller</dt><dd>Example Ltd.</dd></div>
    <div><dt>Size</dt><dd>123 MB</dd></div>
  </dl>
</body></html>
`;

function stubPage(html: string) {
  const impl = vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve(new Response(html, { status: 200 }))
  );
  vi.stubGlobal('fetch', impl);
  return impl;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseInAppPurchases', () => {
  it('extracts title/price pairs matching on the heading text', () => {
    expect(parseInAppPurchases(pageWithIap)).toEqual([
      { title: '10 Gold Bars', price: '$1.99' },
      { title: 'Extra Moves', price: '$0.99' },
      { title: 'Season Pass', price: '$9.99' },
    ]);
  });

  it('returns an empty array when there is no In-App Purchases block', () => {
    expect(parseInAppPurchases(pageWithoutIap)).toEqual([]);
  });

  it('returns an empty array for unrelated markup', () => {
    expect(parseInAppPurchases('<html><body><p>nothing here</p></body></html>')).toEqual([]);
  });
});

describe('inAppPurchases', () => {
  it('throws when id is missing', async () => {
    // @ts-expect-error deliberately omitting the required id
    await expect(inAppPurchases({})).rejects.toThrow('id is required');
  });

  it('fetches the app page and returns parsed purchases', async () => {
    const impl = stubPage(pageWithIap);
    const result = await inAppPurchases({ id: 553834731 });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ title: '10 Gold Bars', price: '$1.99' });
    expect(impl).toHaveBeenCalledTimes(1);
    const calledUrl = impl.mock.calls[0]?.[0] ?? '';
    expect(calledUrl).toContain('/us/app/id553834731');
  });

  it('honors the country option in the URL', async () => {
    const impl = stubPage(pageWithoutIap);
    await inAppPurchases({ id: 1, country: 'gb' });
    const calledUrl = impl.mock.calls[0]?.[0] ?? '';
    expect(calledUrl).toContain('/gb/app/id1');
  });

  // Network smoke test — Candy Crush Saga reliably has in-app purchases.
  itNetwork('returns real in-app purchases for a live app', { timeout: 15000 }, async () => {
    const result = await inAppPurchases({ id: 553834731 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result[0]!.title).toBe('string');
    expect(typeof result[0]!.price).toBe('string');
  });
});

describe('app({ iap: true })', () => {
  itNetwork('attaches in-app purchases to the returned app', { timeout: 20000 }, async () => {
    const result = await app({ id: 553834731, iap: true });
    expect(Array.isArray(result.inAppPurchases)).toBe(true);
    expect(result.inAppPurchases!.length).toBeGreaterThan(0);
  });

  itNetwork('omits in-app purchases when the option is not set', { timeout: 20000 }, async () => {
    const result = await app({ id: 553834731 });
    expect(result.inAppPurchases).toBeUndefined();
  });
});
