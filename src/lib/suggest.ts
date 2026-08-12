import * as cheerio from 'cheerio';
import type { Suggestion } from '../types/review.js';
import type { SuggestOptions } from '../types/options.js';
import { doRequest, storeId } from './common.js';

/**
 * Retrieves search term suggestions (autocomplete)
 * @param options - Options including search term
 * @returns Promise resolving to array of suggestions
 *
 * @example
 * ```typescript
 * const suggestions = await suggest({ term: 'min' });
 *  Returns: [{ term: 'minecraft' }, { term: 'minecraft pocket edition' }, ...]
 * ```
 */
export async function suggest(options: SuggestOptions): Promise<Suggestion[]> {
  const { term, country = 'us', requestOptions } = options;

  if (!term) {
    throw new Error('term is required');
  }

  // Apple's hints endpoint returns an empty list unless the storefront is
  // provided via the X-Apple-Store-Front header.
  const storeFront = storeId(country);
  const url = `https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints?clientApplication=Software&term=${encodeURIComponent(term)}`;

  const body = await doRequest(url, {
    ...(requestOptions || {}),
    headers: {
      'X-Apple-Store-Front': `${storeFront},12`,
      ...(requestOptions?.headers || {}),
    },
  });

  // The response is an Apple plist (XML). Each suggestion lives in a
  // `<dict>` inside the top-level `<array>`, e.g.:
  //   <dict>
  //     <key>term</key><string>minecraft</string>
  //     <key>url</key><string>https://…</string>
  //   </dict>
  // We parse it with cheerio (already a dependency) in XML mode.
  const $ = cheerio.load(body, { xmlMode: true });

  const suggestions: Suggestion[] = [];

  $('plist > dict > array > dict').each((_, dictEl) => {
    let hintTerm: string | undefined;

    // Prefer the value that follows the `term` key.
    $(dictEl)
      .children('key')
      .each((__, keyEl) => {
        if ($(keyEl).text().trim() === 'term') {
          hintTerm = $(keyEl).next('string').text().trim();
        }
      });

    // Fall back to the first <string> if no explicit `term` key is present.
    if (!hintTerm) {
      hintTerm = $(dictEl).children('string').first().text().trim();
    }

    if (hintTerm) {
      suggestions.push({ term: hintTerm });
    }
  });

  return suggestions;
}
