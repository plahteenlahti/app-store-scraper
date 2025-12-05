import { XMLParser } from 'fast-xml-parser';
import type { Suggestion } from '../types/review.js';
import type { SuggestOptions } from '../types/options.js';
import { doRequest } from './common.js';
import { suggestResponseSchema } from './schemas.js';

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
  const { term, requestOptions } = options;

  if (!term) {
    throw new Error('term is required');
  }

  const url = `https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints?clientApplication=Software&term=${encodeURIComponent(term)}`;

  const body = await doRequest(url, requestOptions);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsedData = parser.parse(body) as unknown;

  // Validate response with Zod
  const validationResult = suggestResponseSchema.safeParse(parsedData);

  if (!validationResult.success) {
    throw new Error(
      `Suggest API response validation failed: ${validationResult.error.message}`
    );
  }

  const result = validationResult.data;

  // Navigate the plist structure to extract suggestions
  const arrayData = result.plist?.dict?.array;

  // If array is a string or doesn't have dict, return empty
  if (!arrayData || typeof arrayData === 'string' || !arrayData.dict) {
    return [];
  }

  const dicts = arrayData.dict || [];

  const suggestions: Suggestion[] = [];

  for (const dict of dicts) {
    const strings = Array.isArray(dict.string) ? dict.string : [dict.string];
    const term = strings[0];
    if (term) {
      suggestions.push({ term });
    }
  }

  return suggestions;
}
