import * as cheerio from 'cheerio';
import type { InAppPurchase } from '../types/app.js';
import type { InAppPurchasesOptions } from '../types/options.js';
import { doRequest } from './common.js';

/**
 * Parses the top in-app purchases out of an App Store product page.
 *
 * The page renders them under a `<dt>In-App Purchases</dt>` / `<dd>` block, with
 * each purchase as a list item holding two spans (title and formatted price).
 * We match the block by its heading text rather than the volatile,
 * build-specific CSS class names, so this survives Apple's styling churn.
 *
 * Exported for testing; prefer {@link inAppPurchases} in application code.
 */
export function parseInAppPurchases(html: string): InAppPurchase[] {
  const $ = cheerio.load(html);
  const purchases: InAppPurchase[] = [];

  $('dt').each((_, dt) => {
    if ($(dt).text().trim() !== 'In-App Purchases') return;

    const dd = $(dt).nextAll('dd').first();
    dd.find('li').each((_, li) => {
      const spans = $(li).find('span');
      if (spans.length < 2) return;

      const title = $(spans[0]).text().trim();
      const price = $(spans[spans.length - 1]).text().trim();
      if (title && price) {
        purchases.push({ title, price });
      }
    });
  });

  return purchases;
}

/**
 * Retrieves the top in-app purchases for an app by scraping the App Store page.
 *
 * Apple only surfaces the top purchases (typically up to 10) with a localized
 * display name and formatted price — there is no numeric amount or product
 * identifier available on the page.
 *
 * @param options - Options including the app id and optional country
 * @returns Promise resolving to the list of in-app purchases (empty if none)
 *
 * @example
 * ```typescript
 * const iaps = await inAppPurchases({ id: 553834731 });
 * // [{ title: '10 Gold Bars', price: '$1.99' }, ...]
 * ```
 */
export async function inAppPurchases(
  options: InAppPurchasesOptions
): Promise<InAppPurchase[]> {
  const { id, country = 'us', requestOptions } = options;

  if (!id) {
    throw new Error('id is required');
  }

  const url = `https://apps.apple.com/${country}/app/id${id}`;
  const body = await doRequest(url, requestOptions);

  return parseInAppPurchases(body);
}
