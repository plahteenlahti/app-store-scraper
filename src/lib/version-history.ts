import * as cheerio from 'cheerio';
import type { VersionHistory } from '../types/review.js';
import type { VersionHistoryOptions } from '../types/options.js';
import { doRequest } from './common.js';

/**
 * Retrieves version history for an app
 * @param options - Options including app id
 * @returns Promise resolving to array of version history entries
 *
 * @example
 * ```typescript
 * const history = await versionHistory({ id: 553834731 });
 * ```
 */
export async function versionHistory(options: VersionHistoryOptions): Promise<VersionHistory[]> {
  const { id, country = 'us', requestOptions } = options;

  if (!id) {
    throw new Error('id is required');
  }

  // Fetch the app page which contains version history in the HTML
  const appPageUrl = `https://apps.apple.com/${country}/app/id${id}`;
  const appPageBody = await doRequest(appPageUrl, requestOptions);

  // Parse the HTML
  const $ = cheerio.load(appPageBody);

  // Find all version history entries in the dialog
  const versions: VersionHistory[] = [];

  // Select all article elements within the version history dialog
  $('dialog[data-testid="dialog"] article.svelte-13339ih').each((_, element) => {
    const $article = $(element);

    // Extract release notes from the paragraph
    const releaseNotes = $article.find('p.svelte-13339ih').text().trim();

    // Extract version number from h4
    const versionDisplay = $article.find('h4.svelte-13339ih').text().trim();

    // Extract release date from time element
    const releaseDateRaw = $article.find('time').attr('datetime') || '';

    versions.push({
      versionDisplay,
      releaseDate: releaseDateRaw,
      releaseNotes: releaseNotes || undefined,
    });
  });

  return versions;
}
