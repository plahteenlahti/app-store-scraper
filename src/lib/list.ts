import type { App, ListApp } from '../types/app.js';
import type { ListOptions } from '../types/options.js';
import { collection as collectionConstants } from '../types/constants.js';
import { doRequest, lookup, ensureArray } from './common.js';
import { rssFeedSchema, type RSSFeedEntry } from './schemas.js';

/**
 * Parses the numeric developer ID out of a developer App Store URL such as
 * `https://apps.apple.com/us/developer/acme/id123456789?uo=2`.
 */
function parseDeveloperId(href?: string): number | undefined {
  if (!href) return undefined;
  const match = href.match(/\/id(\d+)/);
  return match ? parseInt(match[1]!, 10) : undefined;
}

/**
 * Picks the largest icon from the feed entry's image list.
 */
function largestIcon(images?: RSSFeedEntry['im:image']): string {
  if (!images || images.length === 0) return '';
  const withHeight = images
    .map((img) => ({
      url: img.label ?? '',
      height: img.attributes?.height ? parseInt(img.attributes.height, 10) : 0,
    }))
    .filter((img) => img.url);
  if (withHeight.length === 0) return '';
  withHeight.sort((a, b) => b.height - a.height);
  return withHeight[0]!.url;
}

/**
 * Converts a raw RSS chart feed entry into a lightweight {@link ListApp}.
 */
function cleanListApp(entry: RSSFeedEntry): ListApp {
  const amount = entry['im:price']?.attributes?.amount;
  const price = amount != null ? parseFloat(amount) : 0;

  return {
    id: parseInt(entry.id?.attributes?.['im:id'] ?? '0', 10),
    appId: entry.id?.attributes?.['im:bundleId'] ?? '',
    title: entry['im:name']?.label ?? '',
    icon: largestIcon(entry['im:image']),
    url: entry.id?.label ?? '',
    price: Number.isNaN(price) ? 0 : price,
    currency: entry['im:price']?.attributes?.currency ?? 'USD',
    free: (Number.isNaN(price) ? 0 : price) === 0,
    description: entry.summary?.label,
    developer: entry['im:artist']?.label ?? '',
    developerUrl: entry['im:artist']?.attributes?.href ?? '',
    developerId: parseDeveloperId(entry['im:artist']?.attributes?.href),
    genre: entry.category?.attributes?.label ?? entry.category?.attributes?.term ?? '',
    genreId: entry.category?.attributes?.['im:id'] ?? '',
    released: entry['im:releaseDate']?.label ?? '',
  };
}

/**
 * Retrieves a list of apps from iTunes chart collections.
 *
 * With `fullDetail: true` (the default) each app is resolved to a complete
 * {@link App} via a lookup request. With `fullDetail: false` the results are
 * returned as lightweight {@link ListApp} records parsed straight from the
 * chart feed, saving the extra request.
 *
 * @example
 * ```typescript
 * // Full app details (default)
 * const apps = await list({ collection: collection.TOP_FREE_IOS });
 *
 * // Lightweight results in a single request
 * const light = await list({ collection: collection.TOP_FREE_IOS, fullDetail: false });
 * ```
 */
export function list(options: ListOptions & { fullDetail?: true }): Promise<App[]>;
export function list(options: ListOptions & { fullDetail: false }): Promise<ListApp[]>;
export function list(options?: ListOptions): Promise<App[]>;
export async function list(options: ListOptions = {}): Promise<App[] | ListApp[]> {
  const {
    collection = collectionConstants.TOP_FREE_IOS,
    category,
    num = 50,
    country = 'us',
    lang,
    fullDetail = true,
    requestOptions,
  } = options;

  // Enforce maximum
  const limit = Math.min(num, 200);

  // Build URL
  let url = `https://itunes.apple.com/${country}/rss/${collection}`;

  if (category) {
    url += `/genre=${category}`;
  }

  url += `/limit=${limit}/json`;

  const body = await doRequest(url, requestOptions);

  // Parse and validate response with Zod
  const parsedData = JSON.parse(body) as unknown;
  const validationResult = rssFeedSchema.safeParse(parsedData);

  if (!validationResult.success) {
    throw new Error(
      `List API response validation failed: ${validationResult.error.message}`
    );
  }

  const data = validationResult.data;

  // Apple returns a single object (not an array) when the feed has one entry.
  const entries = ensureArray(data.feed?.entry);

  if (entries.length === 0) {
    return [];
  }

  // Lightweight path: build records straight from the feed, no extra request.
  if (!fullDetail) {
    return entries.map((entry) => cleanListApp(entry));
  }

  // Full-detail path: resolve every ID to a complete App via a lookup.
  const ids = entries
    .map((entry) => {
      const id = entry.id?.attributes?.['im:id'];
      return id ? parseInt(id, 10) : null;
    })
    .filter((id): id is number => id !== null);

  if (ids.length === 0) {
    return [];
  }

  return lookup(ids, 'id', country, lang, requestOptions);
}
