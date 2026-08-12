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

  const versions: VersionHistory[] = [];

  // The version history lives in a <dialog> as a list of rows, each containing
  // a `.metadata` block with the version number (<span>) and release date
  // (<time datetime>), plus release notes in a sibling paragraph. Apple's
  // markup uses hashed Svelte class names that change on every site rebuild, so
  // we anchor on the stable semantic `.metadata` + `time[datetime]` signature.
  //
  // Identify the version-history dialog by content rather than a fixed index:
  // it is the dialog containing the most dated metadata rows (other dialogs
  // contain none).
  const dialogs = $('dialog').toArray();
  let dialog: (typeof dialogs)[number] | null = null;
  let dialogRowCount = 0;
  for (const element of dialogs) {
    const rowCount = $(element)
      .find('div.metadata')
      .filter((_, row) => $(row).find('time[datetime]').length > 0).length;
    if (rowCount > dialogRowCount) {
      dialogRowCount = rowCount;
      dialog = element;
    }
  }

  if (!dialog) {
    return versions;
  }

  $(dialog)
    .find('div.metadata')
    .each((_, element) => {
      const $metadata = $(element);
      const $time = $metadata.find('time[datetime]').first();
      if (!$time.length) {
        return;
      }

      // Version number is the first span in the metadata block (e.g. "26.40")
      const versionDisplay = $metadata.find('span').first().text().trim();
      const releaseDate = $time.attr('datetime') || '';
      // Release notes sit in the row's paragraph, alongside the metadata block
      const releaseNotes = $metadata.closest('.inner').find('p').first().text().trim();

      versions.push({
        versionDisplay,
        releaseDate,
        releaseNotes: releaseNotes || undefined,
      });
    });

  return versions;
}
