import type { App } from '../types/app.js';
import type { AppOptions } from '../types/options.js';
import { lookup, validateRequiredField } from './common.js';
import { ratings } from './ratings.js';

/**
 * Retrieves detailed information about an app from the App Store
 * @param options - Options including either id (trackId) or appId (bundleId)
 * @returns Promise resolving to app details
 * @throws Error if neither id nor appId is provided
 *
 * @example
 * ```typescript
 * // Get app by ID
 * const app = await app({ id: 553834731 });
 *
 * // Get app by bundle ID
 * const app = await app({ appId: 'com.midasplayer.apps.candycrushsaga' });
 *
 * // Get app with rating histogram
 * const app = await app({ id: 553834731, ratings: true });
 * ```
 */
export async function app(options: AppOptions): Promise<App> {
  validateRequiredField(options as Record<string, unknown>, ['id', 'appId'], 'Either id or appId is required');

  const { id, appId, country = 'us', lang, ratings: includeRatings, requestOptions } = options;

  const apps = await lookup(
    (id || appId) as number,
    id ? 'id' : 'bundleId',
    country,
    lang,
    requestOptions
  );

  if (apps.length === 0) {
    throw new Error(`App not found: ${id || appId}`);
  }

  const appData = apps[0]!;

  // Optionally include rating histogram
  if (includeRatings) {
    try {
      const ratingsData = await ratings({ id: appData.id, country, requestOptions });
      appData.histogram = ratingsData.histogram;
    } catch (error) {
      // Ratings might not be available for all apps
      // Continue without histogram rather than failing
    }
  }

  return appData;
}
