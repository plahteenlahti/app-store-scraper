/**
 * Represents a complete app from the iTunes/Mac App Store
 */
interface App {
    /** Track ID (numeric identifier) */
    id: number;
    /** Bundle identifier (e.g., com.example.app) */
    appId: string;
    /** App name/title */
    title: string;
    /** iTunes store URL */
    url: string;
    /** Full app description */
    description: string;
    /** App icon URL (usually 512x512 or 1024x1024) */
    icon: string;
    /** Array of genre names */
    genres: string[];
    /** Array of genre IDs */
    genreIds: string[];
    /** Primary genre name */
    primaryGenre: string;
    /** Primary genre ID */
    primaryGenreId: string;
    /** Content rating (e.g., "4+", "12+", "17+") */
    contentRating: string;
    /** Supported languages (array of language codes) */
    languages: string[];
    /** File size in bytes */
    size: string;
    /** Required iOS/macOS version */
    requiredOsVersion: string;
    /** Initial release date */
    released: string;
    /** Last update date */
    updated: string;
    /** Latest version release notes */
    releaseNotes: string;
    /** Current version number */
    version: string;
    /** Price in local currency */
    price: number;
    /** Currency code (e.g., "USD", "EUR") */
    currency: string;
    /** Whether the app is free */
    free: boolean;
    /** Developer ID (numeric) */
    developerId: number;
    /** Developer name */
    developer: string;
    /** Developer iTunes URL */
    developerUrl: string;
    /** Developer website URL (if available) */
    developerWebsite?: string;
    /** Average user rating (current version) */
    score: number;
    /** Total number of ratings (current version) */
    reviews: number;
    /** Average user rating (all versions) */
    currentVersionScore: number;
    /** Total number of ratings (all versions) */
    currentVersionReviews: number;
    /** iPhone/iPod screenshot URLs */
    screenshots: string[];
    /** iPad screenshot URLs */
    ipadScreenshots: string[];
    /** Apple TV screenshot URLs */
    appletvScreenshots: string[];
    /** List of supported device names */
    supportedDevices: string[];
    /** Rating histogram (only if ratings option is true) */
    histogram?: RatingHistogram;
}
/**
 * Rating distribution histogram
 */
interface RatingHistogram {
    /** Number of 1-star ratings */
    1: number;
    /** Number of 2-star ratings */
    2: number;
    /** Number of 3-star ratings */
    3: number;
    /** Number of 4-star ratings */
    4: number;
    /** Number of 5-star ratings */
    5: number;
}
/**
 * Ratings response with total count and histogram
 */
interface Ratings {
    /** Total number of ratings */
    ratings: number;
    /** Rating distribution by star count */
    histogram: RatingHistogram;
}

/**
 * App Store collection types
 */
declare const collection: {
    readonly TOP_MAC: "topmacapps";
    readonly TOP_FREE_MAC: "topfreemacapps";
    readonly TOP_GROSSING_MAC: "topgrossingmacapps";
    readonly TOP_PAID_MAC: "toppaidmacapps";
    readonly NEW_IOS: "newapplications";
    readonly NEW_FREE_IOS: "newfreeapplications";
    readonly NEW_PAID_IOS: "newpaidapplications";
    readonly TOP_FREE_IOS: "topfreeapplications";
    readonly TOP_FREE_IPAD: "topfreeipadapplications";
    readonly TOP_GROSSING_IOS: "topgrossingapplications";
    readonly TOP_GROSSING_IPAD: "topgrossingipadapplications";
    readonly TOP_PAID_IOS: "toppaidapplications";
    readonly TOP_PAID_IPAD: "toppaidipadapplications";
};
type Collection = (typeof collection)[keyof typeof collection];
/**
 * App categories and subcategories
 */
declare const category: {
    readonly BOOKS: 6018;
    readonly BUSINESS: 6000;
    readonly CATALOGS: 6022;
    readonly EDUCATION: 6017;
    readonly ENTERTAINMENT: 6016;
    readonly FINANCE: 6015;
    readonly FOOD_AND_DRINK: 6023;
    readonly GAMES: 6014;
    readonly GAMES_ACTION: 7001;
    readonly GAMES_ADVENTURE: 7002;
    readonly GAMES_ARCADE: 7003;
    readonly GAMES_BOARD: 7004;
    readonly GAMES_CARD: 7005;
    readonly GAMES_CASINO: 7006;
    readonly GAMES_DICE: 7007;
    readonly GAMES_EDUCATIONAL: 7008;
    readonly GAMES_FAMILY: 7009;
    readonly GAMES_KIDS: 7010;
    readonly GAMES_MUSIC: 7011;
    readonly GAMES_PUZZLE: 7012;
    readonly GAMES_RACING: 7013;
    readonly GAMES_ROLE_PLAYING: 7014;
    readonly GAMES_SIMULATION: 7015;
    readonly GAMES_SPORTS: 7016;
    readonly GAMES_STRATEGY: 7017;
    readonly GAMES_TRIVIA: 7018;
    readonly GAMES_WORD: 7019;
    readonly HEALTH_AND_FITNESS: 6013;
    readonly LIFESTYLE: 6012;
    readonly MAGAZINES_AND_NEWSPAPERS: 6021;
    readonly MAGAZINES_ARTS: 13007;
    readonly MAGAZINES_AUTOMOTIVE: 13006;
    readonly MAGAZINES_WEDDINGS: 13008;
    readonly MAGAZINES_BUSINESS: 13009;
    readonly MAGAZINES_CHILDREN: 13010;
    readonly MAGAZINES_COMPUTER: 13011;
    readonly MAGAZINES_FOOD: 13012;
    readonly MAGAZINES_CRAFTS: 13013;
    readonly MAGAZINES_ELECTRONICS: 13014;
    readonly MAGAZINES_ENTERTAINMENT: 13015;
    readonly MAGAZINES_FASHION: 13002;
    readonly MAGAZINES_HEALTH: 13017;
    readonly MAGAZINES_HISTORY: 13018;
    readonly MAGAZINES_HOME: 13003;
    readonly MAGAZINES_LITERARY: 13019;
    readonly MAGAZINES_MEN: 13020;
    readonly MAGAZINES_MOVIES_AND_MUSIC: 13021;
    readonly MAGAZINES_POLITICS: 13001;
    readonly MAGAZINES_OUTDOORS: 13004;
    readonly MAGAZINES_FAMILY: 13023;
    readonly MAGAZINES_PETS: 13024;
    readonly MAGAZINES_PROFESSIONAL: 13025;
    readonly MAGAZINES_REGIONAL: 13026;
    readonly MAGAZINES_SCIENCE: 13027;
    readonly MAGAZINES_SPORTS: 13005;
    readonly MAGAZINES_TEENS: 13028;
    readonly MAGAZINES_TRAVEL: 13029;
    readonly MAGAZINES_WOMEN: 13030;
    readonly MEDICAL: 6020;
    readonly MUSIC: 6011;
    readonly NAVIGATION: 6010;
    readonly NEWS: 6009;
    readonly PHOTO_AND_VIDEO: 6008;
    readonly PRODUCTIVITY: 6007;
    readonly REFERENCE: 6006;
    readonly SHOPPING: 6024;
    readonly SOCIAL_NETWORKING: 6005;
    readonly SPORTS: 6004;
    readonly STICKERS: 6025;
    readonly TRAVEL: 6003;
    readonly UTILITIES: 6002;
    readonly WEATHER: 6001;
};
type Category = (typeof category)[keyof typeof category];
/**
 * Device types
 */
declare const device: {
    readonly IPAD: "iPadSoftware";
    readonly MAC: "macSoftware";
    readonly ALL: "software";
};
type Device = (typeof device)[keyof typeof device];
/**
 * Review sort options
 */
declare const sort: {
    readonly RECENT: "mostRecent";
    readonly HELPFUL: "mostHelpful";
};
type Sort = (typeof sort)[keyof typeof sort];
/**
 * Country code to Apple Store ID mapping
 */
declare const markets: Record<string, number>;

interface RequestOptions {
    headers?: Record<string, string>;
}
/**
 * Common options for requests
 */
interface BaseOptions {
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
interface AppOptions extends BaseOptions {
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
interface ListOptions extends BaseOptions {
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
interface SearchOptions extends BaseOptions {
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
interface DeveloperOptions extends BaseOptions {
    /** Developer ID (artistId) - required */
    devId: number;
}
/**
 * Options for the reviews() method
 */
interface ReviewsOptions extends BaseOptions {
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
interface RatingsOptions extends Omit<BaseOptions, 'lang'> {
    /** Track ID (required) */
    id: number;
}
/**
 * Options for the similar() method
 */
interface SimilarOptions extends BaseOptions {
    /** Track ID */
    id?: number;
    /** Bundle ID */
    appId?: string;
}
/**
 * Options for the suggest() method
 */
interface SuggestOptions extends Omit<BaseOptions, 'lang'> {
    /** Search term (required) */
    term: string;
}
/**
 * Options for the privacy() method
 */
interface PrivacyOptions extends Omit<BaseOptions, 'lang'> {
    /** Track ID (required) */
    id: number;
}
/**
 * Options for the versionHistory() method
 */
interface VersionHistoryOptions extends Omit<BaseOptions, 'lang'> {
    /** Track ID (required) */
    id: number;
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
declare function app(options: AppOptions): Promise<App>;

/**
 * Retrieves a list of apps from iTunes collections
 * @param options - Options for filtering and pagination
 * @returns Promise resolving to array of apps
 *
 * @example
 * ```typescript
 * // Get top 50 free iOS apps
 * const apps = await list({ collection: collection.TOP_FREE_IOS });
 *
 * // Get top 100 paid games
 * const apps = await list({
 *   collection: collection.TOP_PAID_IOS,
 *   category: category.GAMES,
 *   num: 100
 * });
 *
 * // Get full details for each app
 * const apps = await list({
 *   collection: collection.TOP_FREE_IOS,
 *   num: 10,
 *   fullDetail: true
 * });
 * ```
 */
declare function list(options?: ListOptions): Promise<App[]>;

/**
 * Searches for apps in the App Store
 * @param options - Search options including term, pagination, etc.
 * @returns Promise resolving to array of apps or app IDs
 *
 * @example
 * ```typescript
 * // Basic search
 * const apps = await search({ term: 'minecraft' });
 *
 * // Search with pagination
 * const apps = await search({
 *   term: 'puzzle game',
 *   num: 25,
 *   page: 2
 * });
 *
 * // Get only IDs
 * const ids = await search({
 *   term: 'social',
 *   idsOnly: true
 * });
 * ```
 */
declare function search(options: SearchOptions): Promise<App[] | number[]>;

/**
 * Retrieves all apps from a specific developer
 * @param options - Options including developer ID
 * @returns Promise resolving to array of apps
 *
 * @example
 * ```typescript
 * const apps = await developer({ devId: 284882218 });
 * ```
 */
declare function developer(options: DeveloperOptions): Promise<App[]>;

/**
 * Represents a user review from the App Store
 */
interface Review {
    /** Unique review ID */
    id: string;
    /** Review author username */
    userName: string;
    /** Author's iTunes URL */
    userUrl: string;
    /** App version this review is for */
    version: string;
    /** Star rating (1-5) */
    score: number;
    /** Review title/headline */
    title: string;
    /** Review body text */
    text: string;
    /** Review submission date */
    updated: string;
}
/**
 * Represents version history information
 */
interface VersionHistory {
    /** Version number */
    versionDisplay: string;
    /** Release date */
    releaseDate: string;
    /** Release notes */
    releaseNotes?: string;
}
/**
 * Represents search suggestion
 */
interface Suggestion {
    /** Suggested search term */
    term: string;
}
/**
 * Represents privacy details
 */
interface PrivacyDetails {
    /** Privacy manifest URL */
    managePrivacyChoicesUrl?: string;
    /** Privacy policy URL */
    privacyPolicyUrl?: string;
    /** Privacy policy text */
    privacyPolicyText?: string;
    /** Privacy types (data collection categories) */
    privacyTypes?: PrivacyType[];
}
/**
 * Privacy data type category
 */
interface PrivacyType {
    /** Privacy type identifier */
    privacyType: string;
    /** Human-readable privacy type name */
    name: string;
    /** Description of data collection */
    description: string;
    /** Data categories collected */
    dataCategories?: string[];
    /** Purposes for data collection */
    purposes?: string[];
}

/**
 * Retrieves user reviews for an app
 * @param options - Options including app id, pagination, and sorting
 * @returns Promise resolving to array of reviews
 *
 * @example
 * ```typescript
 * // Get recent reviews
 * const reviews = await reviews({ id: 553834731 });
 *
 * // Get helpful reviews, page 2
 * const reviews = await reviews({
 *   id: 553834731,
 *   sort: sort.HELPFUL,
 *   page: 2
 * });
 *
 * // Get reviews by bundle ID
 * const reviews = await reviews({
 *   appId: 'com.midasplayer.apps.candycrushsaga',
 *   page: 1
 * });
 * ```
 */
declare function reviews(options: ReviewsOptions): Promise<Review[]>;

/**
 * Retrieves the rating histogram for an app (1-5 star breakdown)
 * @param options - Options including app id
 * @returns Promise resolving to ratings with total count and histogram
 *
 * @example
 * ```typescript
 * const result = await ratings({ id: 553834731 });
 * // Returns: { ratings: 4800, histogram: { 1: 100, 2: 200, 3: 500, 4: 1000, 5: 3000 } }
 * ```
 */
declare function ratings(options: RatingsOptions): Promise<Ratings>;

/**
 * Retrieves similar apps ("Customers Also Bought" section)
 * @param options - Options including app id or appId
 * @returns Promise resolving to array of similar apps
 *
 * @example
 * ```typescript
 * const similar = await similar({ id: 553834731 });
 * ```
 */
declare function similar(options: SimilarOptions): Promise<App[]>;

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
declare function suggest(options: SuggestOptions): Promise<Suggestion[]>;

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
declare function privacy(options: PrivacyOptions): Promise<PrivacyDetails>;

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
declare function versionHistory(options: VersionHistoryOptions): Promise<VersionHistory[]>;

export { type App, type AppOptions, type BaseOptions, type Category, type Collection, type DeveloperOptions, type Device, type ListOptions, type PrivacyDetails, type PrivacyOptions, type PrivacyType, type RatingHistogram, type Ratings, type RatingsOptions, type Review, type ReviewsOptions, type SearchOptions, type SimilarOptions, type Sort, type SuggestOptions, type Suggestion, type VersionHistory, type VersionHistoryOptions, app, category, collection, developer, device, list, markets, privacy, ratings, reviews, search, similar, sort, suggest, versionHistory };
