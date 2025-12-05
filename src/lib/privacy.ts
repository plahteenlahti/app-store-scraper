import * as cheerio from 'cheerio';
import type { PrivacyDetails, PrivacyType } from '../types/review.js';
import type { PrivacyOptions } from '../types/options.js';
import { doRequest } from './common.js';

/**
 * Retrieves privacy policy details for an app
 * @param options - Options including app id
 * @returns Promise resolving to privacy details
 *
 * @example
 * ```typescript
 * const privacy = await privacy({ id: 553834731 });
 * ```
 */
export async function privacy(options: PrivacyOptions): Promise<PrivacyDetails> {
  const { id, country = 'us', requestOptions } = options;

  if (!id) {
    throw new Error('id is required');
  }

  // Fetch the app page which contains privacy info in the HTML
  const appPageUrl = `https://apps.apple.com/${country}/app/id${id}`;
  const appPageBody = await doRequest(appPageUrl, requestOptions);

  // Parse the HTML
  const $ = cheerio.load(appPageBody);

  // Find the privacy policy URL from the dialog
  let privacyPolicyUrl: string | undefined;
  $('dialog[data-testid="dialog"] a[data-test-id="external-link"]').each((_, el) => {
    const ariaLabel = $(el).attr('aria-label');
    if (ariaLabel && ariaLabel.includes('Privacy Policy')) {
      privacyPolicyUrl = $(el).attr('href');
      return false; // break the loop
    }
    return; // continue to next iteration
  });

  // Extract privacy types from the dialog sections
  const privacyTypes: PrivacyType[] = [];

  // Find all purpose sections (Analytics, App Functionality, etc.)
  $('dialog[data-testid="dialog"] section.purpose-section').each((_, section) => {
    const $section = $(section);
    const purpose = $section.find('h3').text().trim();

    // Find all category items within this purpose
    $section.find('li.purpose-category').each((_, category) => {
      const $category = $(category);
      const categoryName = $category.find('.category-title').text().trim();

      // Extract data types
      const dataTypes: string[] = [];
      $category.find('.privacy-data-types li').each((_, li) => {
        dataTypes.push($(li).text().trim());
      });

      if (categoryName && dataTypes.length > 0) {
        privacyTypes.push({
          privacyType: categoryName,
          name: categoryName,
          description: `Used for ${purpose}`,
          dataCategories: dataTypes,
          purposes: [purpose],
        });
      }
    });
  });

  // Build the result
  const result: PrivacyDetails = {};

  if (privacyPolicyUrl) {
    result.privacyPolicyUrl = privacyPolicyUrl;
  }

  if (privacyTypes.length > 0) {
    result.privacyTypes = privacyTypes;
  }

  return result;
}
