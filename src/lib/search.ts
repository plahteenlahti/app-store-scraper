import type { App } from '../types/app.js';
import type { SearchOptions } from '../types/options.js';
import { doRequest, cleanApp } from './common.js';
import { iTunesLookupResponseSchema, type ITunesAppResponse } from './schemas.js';

/**
 * Searches for apps in the App Store.
 *
 * Pagination is implemented client-side: the API is called with a limit of
 * `page * num` so that the requested page has results, then results are sliced
 * to the current page. Higher page numbers therefore request more results
 * from the API.
 *
 * @param options - Search options including term, pagination, etc.
 * @returns Promise resolving to array of apps or app IDs
 *
 * @example
 * ```typescript
 * // Basic search
 * const apps = await search({ term: 'minecraft' });
 *
 * // Search with pagination
 * const apps = await search({
 *   term: 'puzzle game',
 *   num: 25,
 *   page: 2
 * });
 *
 * // Get only IDs
 * const ids = await search({
 *   term: 'social',
 *   idsOnly: true
 * });
 * ```
 */
export async function search(options: SearchOptions): Promise<App[] | number[]> {
  const { term, num = 50, page = 1, country = 'us', lang, idsOnly, requestOptions } = options;

  if (!term) {
    throw new Error('term is required');
  }

  // Request enough results to cover the requested page. The iTunes Search API
  // has no offset parameter, so we request page * num results and slice client-side.
  const limit = page * num;

  const params = new URLSearchParams({
    term,
    country,
    media: 'software',
    entity: 'software',
    limit: String(limit)
  });

  if (lang) {
    params.set('lang', lang);
  }

  const url = `https://itunes.apple.com/search?${params.toString()}`;
  const body = await doRequest(url, requestOptions);

  // Parse and validate response with Zod
  const parsedData: unknown = JSON.parse(body);
  const validationResult = iTunesLookupResponseSchema.safeParse(parsedData);

  if (!validationResult.success) {
    throw new Error(
      `Search API response validation failed: ${validationResult.error.message}`
    );
  }

  const response = validationResult.data;

  // iTunes Search API has no offset; we requested limit = page * num and slice here.
  const allResults = response.results.filter((app: ITunesAppResponse) => app.kind === 'software');

  // Apply pagination
  const start = (page - 1) * num;
  const end = start + num;
  const paginatedResults = allResults.slice(start, end);

  if (idsOnly) {
    return paginatedResults
      .map((result: ITunesAppResponse) => result.trackId)
      .filter((id: number | undefined): id is number => id !== undefined);
  }

  // Convert to App objects
  return paginatedResults.map((result: ITunesAppResponse) => cleanApp(result));
}
