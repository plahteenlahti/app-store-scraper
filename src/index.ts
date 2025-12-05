/**
 * @perttu/app-store-scraper
 * Modern TypeScript library to scrape application data from the iTunes/Mac App Store
 */

// Export all API methods
export { app } from './lib/app.js';
export { list } from './lib/list.js';
export { search } from './lib/search.js';
export { developer } from './lib/developer.js';
export { reviews } from './lib/reviews.js';
export { ratings } from './lib/ratings.js';
export { similar } from './lib/similar.js';
export { suggest } from './lib/suggest.js';
export { privacy } from './lib/privacy.js';
export { versionHistory } from './lib/version-history.js';

// Export types
export type {
  App,
  RatingHistogram,
  Ratings,
  Review,
  VersionHistory,
  Suggestion,
  PrivacyDetails,
  PrivacyType,
  BaseOptions,
  AppOptions,
  ListOptions,
  SearchOptions,
  DeveloperOptions,
  ReviewsOptions,
  RatingsOptions,
  SimilarOptions,
  SuggestOptions,
  PrivacyOptions,
  VersionHistoryOptions,
  Collection,
  Category,
  Device,
  Sort,
} from './types/index.js';

// Export constants
export { collection, category, device, sort, markets } from './types/index.js';
