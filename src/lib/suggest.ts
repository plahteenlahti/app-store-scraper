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
  console.log('Response body length:', body.length);
  console.log('Response body preview:', body.substring(0, 500));

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsedData = parser.parse(body) as unknown;
  console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

  // Validate response with Zod
  const validationResult = suggestResponseSchema.safeParse(parsedData);

  if (!validationResult.success) {
    console.log('Validation error:', validationResult.error.message);
    throw new Error(
      `Suggest API response validation failed: ${validationResult.error.message}`
    );
  }

  const result = validationResult.data;
  console.log('Validated result:', JSON.stringify(result, null, 2));

  // Navigate the plist structure to extract suggestions
  const arrayData = result.plist?.dict?.array;
  console.log('Array data:', JSON.stringify(arrayData, null, 2));

  // If array is a string or doesn't have dict, return empty
  if (!arrayData || typeof arrayData === 'string' || !arrayData.dict) {
    console.log('No dict found in array data, returning empty');
    return [];
  }

  const dicts = arrayData.dict || [];
  console.log('Dicts:', JSON.stringify(dicts, null, 2));

  const suggestions: Suggestion[] = [];

  for (const dict of dicts) {
    const strings = Array.isArray(dict.string) ? dict.string : [dict.string];
    const term = strings[0];
    if (term) {
      suggestions.push({ term });
    }
  }

  console.log('Final suggestions:', suggestions);
  return suggestions;
}
