import type { App } from '../types/app.js';
import { markets } from '../types/constants.js';
import {
  iTunesLookupResponseSchema,
  type ITunesAppResponse,
} from './schemas.js';
import type { RequestOptions } from '../types/options.js';

/**
 * Resolves after `ms`, or rejects early if `signal` aborts.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error('The operation was aborted'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error('The operation was aborted'));
      },
      { once: true }
    );
  });
}

/**
 * Combines several abort signals into one that aborts as soon as any of them do.
 */
function combineSignals(signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const present = signals.filter((s): s is AbortSignal => Boolean(s));
  if (present.length === 0) return undefined;
  if (present.length === 1) return present[0];

  // AbortSignal.any is available on Node 20.3+; fall back to a manual combiner.
  const anyFn = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
  if (typeof anyFn === 'function') {
    return anyFn(present);
  }

  const controller = new AbortController();
  for (const s of present) {
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true });
  }
  return controller.signal;
}

/**
 * Reads a `Retry-After` header (seconds or HTTP date) and returns the delay in
 * milliseconds, or undefined when the header is absent or unparseable.
 */
function retryAfterMs(response: Response): number | undefined {
  const header = response.headers?.get?.('retry-after');
  if (!header) return undefined;

  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000);

  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());

  return undefined;
}

/**
 * A response status is worth retrying when Apple is rate-limiting (429) or
 * having a transient server-side problem (5xx).
 */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Makes an HTTP request, with optional timeout, retries, cancellation, and a
 * pluggable fetch implementation (see {@link RequestOptions}).
 */
export async function doRequest(url: string, options?: RequestOptions): Promise<string> {
  const defaultHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  const fetchImpl = options?.fetch ?? fetch;
  const retries = Math.max(0, options?.retries ?? 0);
  const retryDelay = options?.retryDelay ?? 500;
  const userSignal = options?.signal;

  const backoff = (attempt: number): number => retryDelay * 2 ** attempt;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Each attempt gets a fresh timeout so a slow first try doesn't eat the
    // whole budget for the retries.
    const timeoutSignal =
      options?.timeout != null ? AbortSignal.timeout(options.timeout) : undefined;
    const signal = combineSignals([userSignal, timeoutSignal]);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...(options?.headers || {}),
        },
        ...(signal ? { signal } : {}),
      });
    } catch (error) {
      // A caller-initiated cancel is final — never retry it.
      if (userSignal?.aborted) throw error;
      lastError = error;
      if (attempt < retries) {
        await sleep(backoff(attempt), userSignal);
        continue;
      }
      throw error;
    }

    if (response.ok) {
      return response.text();
    }

    if (isRetryableStatus(response.status) && attempt < retries) {
      const wait = retryAfterMs(response) ?? backoff(attempt);
      await sleep(wait, userSignal);
      continue;
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  throw lastError ?? new Error('Request failed');
}

/**
 * Cleans and transforms an iTunes API response to our App format
 */
export function cleanApp(app: ITunesAppResponse): App {
  return {
    id: app.trackId || 0,
    appId: app.bundleId || '',
    title: app.trackName || '',
    url: app.trackViewUrl || '',
    description: app.description || '',
    icon: app.artworkUrl512 || app.artworkUrl100 || '',
    genres: app.genres || [],
    genreIds: (app.genreIds || []).map(String),
    primaryGenre: app.primaryGenreName || '',
    primaryGenreId: String(app.primaryGenreId || ''),
    contentRating: app.contentAdvisoryRating || '4+',
    languages: app.languageCodesISO2A || [],
    size: app.fileSizeBytes || '0',
    requiredOsVersion: app.minimumOsVersion || '',
    released: app.releaseDate || '',
    updated: app.currentVersionReleaseDate || '',
    releaseNotes: app.releaseNotes || '',
    version: app.version || '',
    price: app.price || 0,
    currency: app.currency || 'USD',
    free: (app.price || 0) === 0,
    developerId: app.artistId || 0,
    developer: app.artistName || '',
    developerUrl: app.artistViewUrl || '',
    developerWebsite: app.sellerUrl,
    score: app.averageUserRating || 0,
    reviews: app.userRatingCount || 0,
    currentVersionScore: app.averageUserRatingForCurrentVersion || 0,
    currentVersionReviews: app.userRatingCountForCurrentVersion || 0,
    screenshots: app.screenshotUrls || [],
    ipadScreenshots: app.ipadScreenshotUrls || [],
    appletvScreenshots: app.appletvScreenshotUrls || [],
    supportedDevices: app.supportedDevices || [],
  };
}

/**
 * Looks up apps by ID, bundle ID, or artist ID from iTunes API
 */
export async function lookup(
  ids: number | number[],
  idField: 'id' | 'bundleId' | 'artistId',
  country = 'us',
  lang?: string,
  requestOptions?: RequestOptions
): Promise<App[]> {
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const idsString = idsArray.join(',');

  // Map idField to the correct URL parameter name
  // artistId should use 'id' parameter, not 'artistId'
  const paramName = idField === 'artistId' ? 'id' : idField;

  const params = new URLSearchParams({
    [paramName]: idsString,
    country,
    entity: 'software',
  });

  if (lang) {
    params.set('lang', lang);
  }

  const url = `https://itunes.apple.com/lookup?${params.toString()}`;
  const body = await doRequest(url, requestOptions);

  const parsedData: unknown = JSON.parse(body);
  const validationResult = iTunesLookupResponseSchema.safeParse(parsedData);

  if (!validationResult.success) {
    throw new Error(
      `iTunes API response validation failed: ${validationResult.error.message}`
    );
  }

  const response = validationResult.data;

  // Filter to only software and clean the results
  // The response may include artist records (wrapperType: "artist") and app records
  // We only want apps, which have kind === 'software' or wrapperType === 'software'
  return response.results
    .filter((app) => app.kind === 'software' || app.wrapperType === 'software')
    .map((app) => cleanApp(app));
}

/**
 * Gets the Apple Store ID for a given country code
 */
export function storeId(country: string): number {
  const id = markets[country.toLowerCase()];
  return id || markets.us || 143441;
}

/**
 * Ensures an array from a value that could be undefined, a single item, or an array
 */
export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Validates that at least one of the required fields is present
 */
export function validateRequiredField(
  options: Record<string, unknown>,
  fields: string[],
  errorMessage: string
): void {
  const hasField = fields.some((field) => options[field] !== undefined);
  if (!hasField) {
    throw new Error(errorMessage);
  }
}
