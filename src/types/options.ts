import type { Collection, Category, Sort } from './constants.js';

export interface RequestOptions {
  headers?: Record<string, string>;
}

/**
 * Common options for requests
 */
export interface BaseOptions {
  /** Two-letter country code (default: "us") */
  country?: string;
  /** Language code (e.g., "en-us") */
  lang?: string;
  /** Custom request options */
  requestOptions?: RequestOptions;
}

/**
 * Options for the app() method
 */
export interface AppOptions extends BaseOptions {
  /** Track ID (numeric) */
  id?: number;
  /** Bundle ID (e.g., com.example.app) */
  appId?: string;
  /** Whether to include rating histogram */
  ratings?: boolean;
}

/**
 * Options for the list() method
 */
export interface ListOptions extends BaseOptions {
  /** Collection type (default: TOP_FREE_IOS) */
  collection?: Collection;
  /** Category/genre filter */
  category?: Category;
  /** Number of results (default: 50, max: 200) */
  num?: number;
  /** Whether to fetch full details for each app */
  fullDetail?: boolean;
}

/**
 * Options for the search() method
 */
export interface SearchOptions extends BaseOptions {
  /** Search term (required) */
  term: string;
  /** Number of results per page (default: 50) */
  num?: number;
  /** Page number (default: 1) */
  page?: number;
  /** Return only app IDs */
  idsOnly?: boolean;
}

/**
 * Options for the developer() method
 */
export interface DeveloperOptions extends BaseOptions {
  /** Developer ID (artistId) - required */
  devId: number;
}

/**
 * Options for the reviews() method
 */
export interface ReviewsOptions extends BaseOptions {
  /** Track ID */
  id?: number;
  /** Bundle ID */
  appId?: string;
  /** Page number (1-10, default: 1) */
  page?: number;
  /** Sort order (default: RECENT) */
  sort?: Sort;
}

/**
 * Options for the ratings() method
 */
export interface RatingsOptions extends Omit<BaseOptions, 'lang'> {
  /** Track ID (required) */
  id: number;
}

/**
 * Options for the similar() method
 */
export interface SimilarOptions extends BaseOptions {
  /** Track ID */
  id?: number;
  /** Bundle ID */
  appId?: string;
}

/**
 * Options for the suggest() method
 */
export interface SuggestOptions extends Omit<BaseOptions, 'lang'> {
  /** Search term (required) */
  term: string;
}

/**
 * Options for the privacy() method
 */
export interface PrivacyOptions extends Omit<BaseOptions, 'lang'> {
  /** Track ID (required) */
  id: number;
}

/**
 * Options for the versionHistory() method
 */
export interface VersionHistoryOptions extends Omit<BaseOptions, 'lang'> {
  /** Track ID (required) */
  id: number;
}

