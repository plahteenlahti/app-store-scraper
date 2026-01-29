import * as cheerio from 'cheerio';
import type { App } from '../types/app.js';
import type { AppOptions } from '../types/options.js';
import { doRequest, lookup, validateRequiredField } from './common.js';
import { ratings } from './ratings.js';

/**
 * Extracts a clean screenshot URL from srcset attribute
 * Takes the highest resolution version
 */
function extractScreenshotUrl(srcset: string): string | null {
  // srcset format: "url1 300w, url2 600w, ..."
  // We want the highest resolution (largest width)
  const entries = srcset.split(',').map(entry => {
    const parts = entry.trim().split(/\s+/);
    const url = parts[0];
    const widthPart = parts[1];
    const widthMatch = widthPart?.match(/(\d+)w/);
    const width = widthMatch?.[1] ? parseInt(widthMatch[1], 10) : 0;
    return { url, width };
  });

  // Sort by width descending and get the largest
  entries.sort((a, b) => b.width - a.width);
  const best = entries[0];

  if (best?.url) {
    // Normalize the URL to a standard format
    // Convert from sized format like /300x650bb.webp to a larger size
    return best.url.replace(/\/\d+x\d+bb(-\d+)?\.(webp|jpg|jpeg|png)$/, '/392x696bb.png');
  }

  return null;
}

/**
 * Scrapes screenshots from the App Store page when the API doesn't return them
 */
async function scrapeScreenshots(
  appId: number,
  country: string,
  requestOptions?: AppOptions['requestOptions']
): Promise<{ screenshots: string[]; ipadScreenshots: string[]; appletvScreenshots: string[] }> {
  const result = {
    screenshots: [] as string[],
    ipadScreenshots: [] as string[],
    appletvScreenshots: [] as string[],
  };

  try {
    const url = `https://apps.apple.com/${country}/app/id${appId}`;
    const body = await doRequest(url, requestOptions);
    const $ = cheerio.load(body);

    // Find screenshot containers by their class patterns
    // iPhone screenshots: shelf-grid__list--grid-type-ScreenshotPhone
    // iPad screenshots: shelf-grid__list--grid-type-ScreenshotPad
    // Apple TV screenshots: shelf-grid__list--grid-type-ScreenshotAppleTv

    // iPhone screenshots
    $('ul.shelf-grid__list--grid-type-ScreenshotPhone source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        const url = extractScreenshotUrl(srcset);
        if (url && !result.screenshots.includes(url)) {
          result.screenshots.push(url);
        }
      }
    });

    // iPad screenshots
    $('ul.shelf-grid__list--grid-type-ScreenshotPad source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        const url = extractScreenshotUrl(srcset);
        if (url && !result.ipadScreenshots.includes(url)) {
          result.ipadScreenshots.push(url);
        }
      }
    });

    // Apple TV screenshots
    $('ul.shelf-grid__list--grid-type-ScreenshotAppleTv source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        const url = extractScreenshotUrl(srcset);
        if (url && !result.appletvScreenshots.includes(url)) {
          result.appletvScreenshots.push(url);
        }
      }
    });
  } catch {
    // If scraping fails, return empty arrays
  }

  return result;
}

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

  // If the API didn't return screenshots, try scraping from the App Store page
  const hasNoScreenshots =
    appData.screenshots.length === 0 &&
    appData.ipadScreenshots.length === 0 &&
    appData.appletvScreenshots.length === 0;

  if (hasNoScreenshots) {
    const scrapedScreenshots = await scrapeScreenshots(appData.id, country, requestOptions);
    appData.screenshots = scrapedScreenshots.screenshots;
    appData.ipadScreenshots = scrapedScreenshots.ipadScreenshots;
    appData.appletvScreenshots = scrapedScreenshots.appletvScreenshots;
  }

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
