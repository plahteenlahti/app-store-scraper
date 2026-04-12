import type { Review } from '../types/review.js';
import type { ReviewsOptions } from '../types/options.js';
import { sort as sortConstants } from '../types/constants.js';
import { doRequest, validateRequiredField, ensureArray } from './common.js';
import { app } from './app.js';
import { reviewsFeedSchema } from './schemas.js';

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

  const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${id}/sortby=${sort}/json`;

  const body = await doRequest(url, requestOptions);

  // Parse and validate response with Zod
  const parsedData = JSON.parse(body) as unknown;
  const validationResult = reviewsFeedSchema.safeParse(parsedData);

  if (!validationResult.success) {
    throw new Error(
      `Reviews API response validation failed: ${validationResult.error.message}`
    );
  }

  const data = validationResult.data;

  // Extract entries (can be single object or array)
  const entries = ensureArray(data.feed?.entry);

  // Filter to only include actual reviews (entries with im:rating)
  // Note: Using slice(1) was incorrect as not all feeds have app metadata as first entry
  const reviewEntries = entries.filter((entry) => entry['im:rating']?.label);

  return reviewEntries.map((entry) => ({
    id: entry.id?.label || '',
    userName: entry.author?.name?.label || '',
    userUrl: entry.author?.uri?.label || '',
    version: entry['im:version']?.label || '',
    score: parseInt(entry['im:rating']?.label || '0', 10),
    title: entry.title?.label || '',
    text: entry.content?.label || '',
    updated: entry.updated?.label || '',
  }));
}
