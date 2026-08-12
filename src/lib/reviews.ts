import * as cheerio from 'cheerio';
import type { Review } from '../types/review.js';
import type { ReviewsOptions } from '../types/options.js';
import { sort as sortConstants } from '../types/constants.js';
import { doRequest, validateRequiredField } from './common.js';
import { app } from './app.js';

// Apple's customer-reviews RSS feed only returns entries for non-browser
// clients. The shared default User-Agent (a Chrome string) makes the feed
// respond with metadata but zero entries, so this request overrides it with an
// iTunes-style agent. The `/json` variant of the feed no longer returns entries
// at all, so we use `/xml` and parse it with cheerio.
const REVIEWS_USER_AGENT = 'iTunes/12.11 (Macintosh; OS X 10.15.7)';

/**
 * Retrieves user reviews for an app
 * @param options - Options including app id, pagination, and sorting
 * @returns Promise resolving to array of reviews
 *
 * @example
 * ```typescript
 * // Get recent reviews
 * const reviews = await reviews({ id: 553834731 });
 *
 * // Get helpful reviews, page 2
 * const reviews = await reviews({
 *   id: 553834731,
 *   sort: sort.HELPFUL,
 *   page: 2
 * });
 *
 * // Get reviews by bundle ID
 * const reviews = await reviews({
 *   appId: 'com.midasplayer.apps.candycrushsaga',
 *   page: 1
 * });
 * ```
 */
export async function reviews(options: ReviewsOptions): Promise<Review[]> {
  validateRequiredField(options as Record<string, unknown>, ['id', 'appId'], 'Either id or appId is required');

  const { appId, page = 1, sort = sortConstants.RECENT, country = 'us', requestOptions } = options;
  let { id } = options;

  // Validate page range
  if (page < 1 || page > 10) {
    throw new Error('Page must be between 1 and 10');
  }

  // If appId is provided, resolve to id first
  if (appId && !id) {
    const appData = await app({ appId, country, requestOptions });
    id = appData.id;
  }

  if (!id) {
    throw new Error('Could not resolve app id');
  }

  const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${id}/sortby=${sort}/xml`;

  const body = await doRequest(url, {
    ...(requestOptions || {}),
    headers: {
      'User-Agent': REVIEWS_USER_AGENT,
      ...(requestOptions?.headers || {}),
    },
  });

  return parseReviews(body);
}

/**
 * Parses the Atom/XML customer-reviews feed into Review objects.
 * The first entry is sometimes app metadata; real reviews are identified by the
 * presence of an `im:rating` element, so metadata rows are filtered out.
 *
 * Exported for unit testing against captured feed fixtures.
 */
export function parseReviews(xml: string): Review[] {
  const $ = cheerio.load(xml, { xmlMode: true });

  return $('entry')
    .toArray()
    .filter((el) => $(el).children('im\\:rating').first().text().trim() !== '')
    .map((el) => {
      const $e = $(el);
      // Prefer the plain-text body; fall back to the first content element.
      const text =
        $e.children('content[type="text"]').first().text().trim() ||
        $e.children('content').first().text().trim();

      return {
        id: $e.children('id').first().text().trim(),
        userName: $e.find('author > name').first().text().trim(),
        userUrl: $e.find('author > uri').first().text().trim(),
        version: $e.children('im\\:version').first().text().trim(),
        score: parseInt($e.children('im\\:rating').first().text().trim() || '0', 10),
        title: $e.children('title').first().text().trim(),
        text,
        updated: $e.children('updated').first().text().trim(),
        voteSum: parseInt($e.children('im\\:voteSum').first().text().trim() || '0', 10),
        voteCount: parseInt($e.children('im\\:voteCount').first().text().trim() || '0', 10),
      };
    });
}
