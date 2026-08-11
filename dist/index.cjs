'use strict';

var cheerio = require('cheerio');
var zod = require('zod');
var fastXmlParser = require('fast-xml-parser');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var cheerio__namespace = /*#__PURE__*/_interopNamespace(cheerio);

// src/lib/app.ts

// src/types/constants.ts
var collection = {
  TOP_MAC: "topmacapps",
  TOP_FREE_MAC: "topfreemacapps",
  TOP_GROSSING_MAC: "topgrossingmacapps",
  TOP_PAID_MAC: "toppaidmacapps",
  NEW_IOS: "newapplications",
  NEW_FREE_IOS: "newfreeapplications",
  NEW_PAID_IOS: "newpaidapplications",
  TOP_FREE_IOS: "topfreeapplications",
  TOP_FREE_IPAD: "topfreeipadapplications",
  TOP_GROSSING_IOS: "topgrossingapplications",
  TOP_GROSSING_IPAD: "topgrossingipadapplications",
  TOP_PAID_IOS: "toppaidapplications",
  TOP_PAID_IPAD: "toppaidipadapplications"
};
var category = {
  BOOKS: 6018,
  BUSINESS: 6e3,
  CATALOGS: 6022,
  EDUCATION: 6017,
  ENTERTAINMENT: 6016,
  FINANCE: 6015,
  FOOD_AND_DRINK: 6023,
  GAMES: 6014,
  GAMES_ACTION: 7001,
  GAMES_ADVENTURE: 7002,
  GAMES_ARCADE: 7003,
  GAMES_BOARD: 7004,
  GAMES_CARD: 7005,
  GAMES_CASINO: 7006,
  GAMES_DICE: 7007,
  GAMES_EDUCATIONAL: 7008,
  GAMES_FAMILY: 7009,
  GAMES_KIDS: 7010,
  GAMES_MUSIC: 7011,
  GAMES_PUZZLE: 7012,
  GAMES_RACING: 7013,
  GAMES_ROLE_PLAYING: 7014,
  GAMES_SIMULATION: 7015,
  GAMES_SPORTS: 7016,
  GAMES_STRATEGY: 7017,
  GAMES_TRIVIA: 7018,
  GAMES_WORD: 7019,
  HEALTH_AND_FITNESS: 6013,
  LIFESTYLE: 6012,
  MAGAZINES_AND_NEWSPAPERS: 6021,
  MAGAZINES_ARTS: 13007,
  MAGAZINES_AUTOMOTIVE: 13006,
  MAGAZINES_WEDDINGS: 13008,
  MAGAZINES_BUSINESS: 13009,
  MAGAZINES_CHILDREN: 13010,
  MAGAZINES_COMPUTER: 13011,
  MAGAZINES_FOOD: 13012,
  MAGAZINES_CRAFTS: 13013,
  MAGAZINES_ELECTRONICS: 13014,
  MAGAZINES_ENTERTAINMENT: 13015,
  MAGAZINES_FASHION: 13002,
  MAGAZINES_HEALTH: 13017,
  MAGAZINES_HISTORY: 13018,
  MAGAZINES_HOME: 13003,
  MAGAZINES_LITERARY: 13019,
  MAGAZINES_MEN: 13020,
  MAGAZINES_MOVIES_AND_MUSIC: 13021,
  MAGAZINES_POLITICS: 13001,
  MAGAZINES_OUTDOORS: 13004,
  MAGAZINES_FAMILY: 13023,
  MAGAZINES_PETS: 13024,
  MAGAZINES_PROFESSIONAL: 13025,
  MAGAZINES_REGIONAL: 13026,
  MAGAZINES_SCIENCE: 13027,
  MAGAZINES_SPORTS: 13005,
  MAGAZINES_TEENS: 13028,
  MAGAZINES_TRAVEL: 13029,
  MAGAZINES_WOMEN: 13030,
  MEDICAL: 6020,
  MUSIC: 6011,
  NAVIGATION: 6010,
  NEWS: 6009,
  PHOTO_AND_VIDEO: 6008,
  PRODUCTIVITY: 6007,
  REFERENCE: 6006,
  SHOPPING: 6024,
  SOCIAL_NETWORKING: 6005,
  SPORTS: 6004,
  STICKERS: 6025,
  TRAVEL: 6003,
  UTILITIES: 6002,
  WEATHER: 6001
};
var device = {
  IPAD: "iPadSoftware",
  MAC: "macSoftware",
  ALL: "software"
};
var sort = {
  RECENT: "mostRecent",
  HELPFUL: "mostHelpful"
};
var markets = {
  dz: 143563,
  ao: 143564,
  ai: 143538,
  ag: 143540,
  ar: 143505,
  am: 143524,
  au: 143460,
  at: 143445,
  az: 143568,
  bs: 143539,
  bh: 143559,
  bb: 143541,
  by: 143565,
  be: 143446,
  bz: 143555,
  bj: 143576,
  bm: 143542,
  bo: 143556,
  bw: 143525,
  br: 143503,
  vg: 143543,
  bn: 143560,
  bg: 143526,
  bf: 143578,
  ca: 143455,
  ky: 143544,
  td: 143581,
  cl: 143483,
  cn: 143465,
  co: 143501,
  cr: 143495,
  ci: 143527,
  hr: 143494,
  cy: 143557,
  cz: 143489,
  dk: 143458,
  dm: 143545,
  do: 143508,
  ec: 143509,
  eg: 143516,
  sv: 143506,
  ee: 143518,
  fj: 143583,
  fi: 143447,
  fr: 143442,
  gm: 143584,
  de: 143443,
  gh: 143573,
  gr: 143448,
  gd: 143546,
  gt: 143504,
  gw: 143585,
  gy: 143553,
  hn: 143510,
  hk: 143463,
  hu: 143482,
  is: 143558,
  in: 143467,
  id: 143476,
  ie: 143449,
  il: 143491,
  it: 143450,
  jm: 143511,
  jp: 143462,
  jo: 143528,
  kz: 143517,
  ke: 143529,
  kr: 143466,
  kw: 143493,
  lv: 143519,
  lb: 143497,
  lt: 143520,
  lu: 143451,
  mo: 143515,
  mk: 143530,
  mg: 143531,
  mw: 143589,
  my: 143473,
  ml: 143532,
  mt: 143521,
  mr: 143590,
  mu: 143533,
  mx: 143468,
  fm: 143591,
  md: 143523,
  mn: 143592,
  ms: 143547,
  mz: 143593,
  na: 143594,
  np: 143484,
  nl: 143452,
  nz: 143461,
  ni: 143512,
  ne: 143534,
  ng: 143561,
  no: 143457,
  om: 143562,
  pk: 143477,
  pw: 143595,
  pa: 143485,
  pg: 143597,
  py: 143513,
  pe: 143507,
  ph: 143474,
  pl: 143478,
  pt: 143453,
  qa: 143498,
  ro: 143487,
  ru: 143469,
  kn: 143548,
  lc: 143549,
  vc: 143550,
  st: 143598,
  sa: 143479,
  sn: 143535,
  sc: 143599,
  sl: 143600,
  sg: 143464,
  sk: 143496,
  si: 143499,
  sb: 143601,
  za: 143472,
  es: 143454,
  lk: 143486,
  sr: 143554,
  sz: 143602,
  se: 143456,
  ch: 143459,
  tw: 143470,
  tj: 143603,
  tz: 143572,
  th: 143475,
  tn: 143536,
  tr: 143480,
  tm: 143604,
  tc: 143551,
  ug: 143537,
  ua: 143492,
  ae: 143481,
  gb: 143444,
  us: 143441,
  uy: 143514,
  uz: 143566,
  ve: 143502,
  vn: 143471,
  ye: 143571,
  zw: 143605
};
var iTunesAppResponseSchema = zod.z.object({
  wrapperType: zod.z.string().optional(),
  kind: zod.z.string().optional(),
  trackId: zod.z.number().optional(),
  bundleId: zod.z.string().optional(),
  trackName: zod.z.string().optional(),
  trackViewUrl: zod.z.string().optional(),
  description: zod.z.string().optional(),
  artworkUrl512: zod.z.string().optional(),
  artworkUrl100: zod.z.string().optional(),
  genres: zod.z.array(zod.z.string()).optional(),
  genreIds: zod.z.array(zod.z.string()).optional(),
  primaryGenreName: zod.z.string().optional(),
  primaryGenreId: zod.z.number().optional(),
  contentAdvisoryRating: zod.z.string().optional(),
  languageCodesISO2A: zod.z.array(zod.z.string()).optional(),
  fileSizeBytes: zod.z.string().optional(),
  minimumOsVersion: zod.z.string().optional(),
  releaseDate: zod.z.string().optional(),
  currentVersionReleaseDate: zod.z.string().optional(),
  releaseNotes: zod.z.string().optional(),
  version: zod.z.string().optional(),
  price: zod.z.number().optional(),
  currency: zod.z.string().optional(),
  artistId: zod.z.number().optional(),
  artistName: zod.z.string().optional(),
  artistViewUrl: zod.z.string().optional(),
  sellerUrl: zod.z.string().optional(),
  averageUserRating: zod.z.number().optional(),
  userRatingCount: zod.z.number().optional(),
  averageUserRatingForCurrentVersion: zod.z.number().optional(),
  userRatingCountForCurrentVersion: zod.z.number().optional(),
  screenshotUrls: zod.z.array(zod.z.string()).optional(),
  ipadScreenshotUrls: zod.z.array(zod.z.string()).optional(),
  appletvScreenshotUrls: zod.z.array(zod.z.string()).optional(),
  supportedDevices: zod.z.array(zod.z.string()).optional()
}).passthrough();
var iTunesLookupResponseSchema = zod.z.object({
  resultCount: zod.z.number(),
  results: zod.z.array(iTunesAppResponseSchema)
});
var rssFeedEntrySchema = zod.z.object({
  id: zod.z.object({
    attributes: zod.z.object({
      "im:id": zod.z.string().optional()
    }).optional()
  }).optional()
});
var rssFeedSchema = zod.z.object({
  feed: zod.z.object({
    entry: zod.z.array(rssFeedEntrySchema).optional()
  }).optional()
});
var reviewEntrySchema = zod.z.object({
  author: zod.z.object({
    uri: zod.z.object({
      label: zod.z.string().optional()
    }).optional(),
    name: zod.z.object({
      label: zod.z.string().optional()
    }).optional()
  }).optional(),
  "im:version": zod.z.object({
    label: zod.z.string().optional()
  }).optional(),
  "im:rating": zod.z.object({
    label: zod.z.string().optional()
  }).optional(),
  title: zod.z.object({
    label: zod.z.string().optional()
  }).optional(),
  content: zod.z.object({
    label: zod.z.string().optional()
  }).optional(),
  id: zod.z.object({
    label: zod.z.string().optional()
  }).optional(),
  updated: zod.z.object({
    label: zod.z.string().optional()
  }).optional()
});
var reviewsFeedSchema = zod.z.object({
  feed: zod.z.object({
    entry: zod.z.union([reviewEntrySchema, zod.z.array(reviewEntrySchema)]).optional()
  }).optional()
});
var suggestDictSchema = zod.z.object({
  string: zod.z.union([zod.z.string(), zod.z.array(zod.z.string())]).optional()
});
var suggestResponseSchema = zod.z.object({
  plist: zod.z.object({
    dict: zod.z.object({
      array: zod.z.union([
        zod.z.string(),
        zod.z.object({
          dict: zod.z.array(suggestDictSchema).optional()
        })
      ]).optional()
    }).optional()
  }).optional()
});
var privacyTypeSchema = zod.z.object({
  privacyType: zod.z.string().optional(),
  identifier: zod.z.string().optional(),
  description: zod.z.string().optional(),
  dataCategories: zod.z.array(zod.z.string()).optional(),
  purposes: zod.z.array(zod.z.string()).optional()
});
var privacyDetailsSchema = zod.z.object({
  managePrivacyChoicesUrl: zod.z.string().optional(),
  privacyPolicyUrl: zod.z.string().optional(),
  privacyPolicyText: zod.z.string().optional(),
  privacyTypes: zod.z.array(privacyTypeSchema).optional()
});
zod.z.object({
  data: zod.z.array(
    zod.z.object({
      attributes: zod.z.object({
        privacyDetails: privacyDetailsSchema.optional()
      }).optional()
    })
  ).optional()
});
var versionHistoryEntrySchema = zod.z.object({
  versionDisplay: zod.z.string().optional(),
  releaseDate: zod.z.string().optional(),
  releaseNotes: zod.z.string().optional()
});
zod.z.object({
  data: zod.z.array(
    zod.z.object({
      attributes: zod.z.object({
        platformAttributes: zod.z.object({
          ios: zod.z.object({
            versionHistory: zod.z.array(versionHistoryEntrySchema).optional()
          }).optional()
        }).optional()
      }).optional()
    })
  ).optional()
});
zod.z.array(zod.z.number());

// src/lib/common.ts
async function doRequest(url, options) {
  const defaultHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
  };
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...defaultHeaders,
      ...options?.headers || {}
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.text();
}
function cleanApp(app2) {
  return {
    id: app2.trackId || 0,
    appId: app2.bundleId || "",
    title: app2.trackName || "",
    url: app2.trackViewUrl || "",
    description: app2.description || "",
    icon: app2.artworkUrl512 || app2.artworkUrl100 || "",
    genres: app2.genres || [],
    genreIds: (app2.genreIds || []).map(String),
    primaryGenre: app2.primaryGenreName || "",
    primaryGenreId: String(app2.primaryGenreId || ""),
    contentRating: app2.contentAdvisoryRating || "4+",
    languages: app2.languageCodesISO2A || [],
    size: app2.fileSizeBytes || "0",
    requiredOsVersion: app2.minimumOsVersion || "",
    released: app2.releaseDate || "",
    updated: app2.currentVersionReleaseDate || "",
    releaseNotes: app2.releaseNotes || "",
    version: app2.version || "",
    price: app2.price || 0,
    currency: app2.currency || "USD",
    free: (app2.price || 0) === 0,
    developerId: app2.artistId || 0,
    developer: app2.artistName || "",
    developerUrl: app2.artistViewUrl || "",
    developerWebsite: app2.sellerUrl,
    score: app2.averageUserRating || 0,
    reviews: app2.userRatingCount || 0,
    currentVersionScore: app2.averageUserRatingForCurrentVersion || 0,
    currentVersionReviews: app2.userRatingCountForCurrentVersion || 0,
    screenshots: app2.screenshotUrls || [],
    ipadScreenshots: app2.ipadScreenshotUrls || [],
    appletvScreenshots: app2.appletvScreenshotUrls || [],
    supportedDevices: app2.supportedDevices || []
  };
}
async function lookup(ids, idField, country = "us", lang, requestOptions) {
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const idsString = idsArray.join(",");
  const paramName = idField === "artistId" ? "id" : idField;
  const params = new URLSearchParams({
    [paramName]: idsString,
    country,
    entity: "software"
  });
  if (lang) {
    params.set("lang", lang);
  }
  const url = `https://itunes.apple.com/lookup?${params.toString()}`;
  const body = await doRequest(url, requestOptions);
  const parsedData = JSON.parse(body);
  const validationResult = iTunesLookupResponseSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new Error(
      `iTunes API response validation failed: ${validationResult.error.message}`
    );
  }
  const response = validationResult.data;
  return response.results.filter((app2) => app2.kind === "software" || app2.wrapperType === "software").map((app2) => cleanApp(app2));
}
function storeId(country) {
  const id = markets[country.toLowerCase()];
  return id || markets.us || 143441;
}
function ensureArray(value) {
  if (value === void 0 || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
function validateRequiredField(options, fields, errorMessage) {
  const hasField = fields.some((field) => options[field] !== void 0);
  if (!hasField) {
    throw new Error(errorMessage);
  }
}
async function ratings(options) {
  const { id, country = "us", requestOptions } = options;
  if (!id) {
    throw new Error("id is required");
  }
  const storeFront = storeId(country);
  const url = `https://itunes.apple.com/${country}/customer-reviews/id${id}?displayable-kind=11`;
  const html = await doRequest(url, {
    ...requestOptions || {},
    headers: {
      "X-Apple-Store-Front": `${storeFront},12`,
      ...requestOptions?.headers || {}
    }
  });
  if (html.length === 0) {
    throw new Error("App not found (404)");
  }
  return parseRatings(html);
}
function parseRatings(html) {
  const $ = cheerio__namespace.load(html);
  const ratingsMatch = $(".rating-count").text().match(/\d+/);
  const totalRatings = Array.isArray(ratingsMatch) && ratingsMatch[0] ? parseInt(ratingsMatch[0], 10) : 0;
  const ratingsByStar = $(".vote .total").map((_, el) => parseInt($(el).text(), 10)).get();
  const histogram = ratingsByStar.reduce(
    (acc, ratingsForStar, index) => {
      const starRating = 5 - index;
      acc[starRating] = ratingsForStar;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );
  return { ratings: totalRatings, histogram };
}

// src/lib/app.ts
function extractScreenshotUrl(srcset) {
  const entries = srcset.split(",").map((entry) => {
    const parts = entry.trim().split(/\s+/);
    const url = parts[0];
    const widthPart = parts[1];
    const widthMatch = widthPart?.match(/(\d+)w/);
    const width = widthMatch?.[1] ? parseInt(widthMatch[1], 10) : 0;
    return { url, width };
  });
  entries.sort((a, b) => b.width - a.width);
  const best = entries[0];
  if (best?.url) {
    return best.url.replace(/\/\d+x\d+bb(-\d+)?\.(webp|jpg|jpeg|png)$/, "/392x696bb.png");
  }
  return null;
}
async function scrapeScreenshots(appId, country, requestOptions) {
  const result = {
    screenshots: [],
    ipadScreenshots: [],
    appletvScreenshots: []
  };
  try {
    const url = `https://apps.apple.com/${country}/app/id${appId}`;
    const body = await doRequest(url, requestOptions);
    const $ = cheerio__namespace.load(body);
    $('ul.shelf-grid__list--grid-type-ScreenshotPhone source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr("srcset");
      if (srcset) {
        const url2 = extractScreenshotUrl(srcset);
        if (url2 && !result.screenshots.includes(url2)) {
          result.screenshots.push(url2);
        }
      }
    });
    $('ul.shelf-grid__list--grid-type-ScreenshotPad source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr("srcset");
      if (srcset) {
        const url2 = extractScreenshotUrl(srcset);
        if (url2 && !result.ipadScreenshots.includes(url2)) {
          result.ipadScreenshots.push(url2);
        }
      }
    });
    $('ul.shelf-grid__list--grid-type-ScreenshotAppleTv source[type="image/webp"]').each((_, el) => {
      const srcset = $(el).attr("srcset");
      if (srcset) {
        const url2 = extractScreenshotUrl(srcset);
        if (url2 && !result.appletvScreenshots.includes(url2)) {
          result.appletvScreenshots.push(url2);
        }
      }
    });
  } catch {
  }
  return result;
}
async function app(options) {
  validateRequiredField(options, ["id", "appId"], "Either id or appId is required");
  const { id, appId, country = "us", lang, ratings: includeRatings, requestOptions } = options;
  const apps = await lookup(
    id || appId,
    id ? "id" : "bundleId",
    country,
    lang,
    requestOptions
  );
  if (apps.length === 0) {
    throw new Error(`App not found: ${id || appId}`);
  }
  const appData = apps[0];
  const hasNoScreenshots = appData.screenshots.length === 0 && appData.ipadScreenshots.length === 0 && appData.appletvScreenshots.length === 0;
  if (hasNoScreenshots) {
    const scrapedScreenshots = await scrapeScreenshots(appData.id, country, requestOptions);
    appData.screenshots = scrapedScreenshots.screenshots;
    appData.ipadScreenshots = scrapedScreenshots.ipadScreenshots;
    appData.appletvScreenshots = scrapedScreenshots.appletvScreenshots;
  }
  if (includeRatings) {
    try {
      const ratingsData = await ratings({ id: appData.id, country, requestOptions });
      appData.histogram = ratingsData.histogram;
    } catch (error) {
    }
  }
  return appData;
}

// src/lib/list.ts
async function list(options = {}) {
  const {
    collection: collection2 = collection.TOP_FREE_IOS,
    category: category2,
    num = 50,
    country = "us",
    lang,
    fullDetail = false,
    requestOptions
  } = options;
  const limit = Math.min(num, 200);
  let url = `https://itunes.apple.com/${country}/rss/${collection2}`;
  if (category2) {
    url += `/genre=${category2}`;
  }
  url += `/limit=${limit}/json`;
  const body = await doRequest(url, requestOptions);
  const parsedData = JSON.parse(body);
  const validationResult = rssFeedSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new Error(
      `List API response validation failed: ${validationResult.error.message}`
    );
  }
  const data = validationResult.data;
  const entries = data.feed?.entry || [];
  const ids = entries.map((entry) => {
    const id = entry.id?.attributes?.["im:id"];
    return id ? parseInt(id, 10) : null;
  }).filter((id) => id !== null);
  if (ids.length === 0) {
    return [];
  }
  if (fullDetail) {
    return lookup(ids, "id", country, lang, requestOptions);
  }
  return lookup(ids, "id", country, lang, requestOptions);
}

// src/lib/search.ts
async function search(options) {
  const { term, num = 50, page = 1, country = "us", lang, idsOnly, requestOptions } = options;
  if (!term) {
    throw new Error("term is required");
  }
  const params = new URLSearchParams({
    term,
    country,
    media: "software",
    entity: "software",
    limit: String(num)
  });
  if (lang) {
    params.set("lang", lang);
  }
  const url = `https://itunes.apple.com/search?${params.toString()}`;
  const body = await doRequest(url, requestOptions);
  const parsedData = JSON.parse(body);
  const validationResult = iTunesLookupResponseSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new Error(
      `Search API response validation failed: ${validationResult.error.message}`
    );
  }
  const response = validationResult.data;
  const allResults = response.results.filter((app2) => app2.kind === "software");
  const start = (page - 1) * num;
  const end = start + num;
  const paginatedResults = allResults.slice(start, end);
  if (idsOnly) {
    return paginatedResults.map((result) => result.trackId).filter((id) => id !== void 0);
  }
  return paginatedResults.map((result) => cleanApp(result));
}

// src/lib/developer.ts
async function developer(options) {
  const { devId, country = "us", lang, requestOptions } = options;
  if (!devId) {
    throw new Error("devId is required");
  }
  return lookup(devId, "artistId", country, lang, requestOptions);
}

// src/lib/reviews.ts
async function reviews(options) {
  validateRequiredField(options, ["id", "appId"], "Either id or appId is required");
  const { appId, page = 1, sort: sort2 = sort.RECENT, country = "us", requestOptions } = options;
  let { id } = options;
  if (page < 1 || page > 10) {
    throw new Error("Page must be between 1 and 10");
  }
  if (appId && !id) {
    const appData = await app({ appId, country, requestOptions });
    id = appData.id;
  }
  if (!id) {
    throw new Error("Could not resolve app id");
  }
  const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${id}/sortby=${sort2}/json`;
  const body = await doRequest(url, requestOptions);
  const parsedData = JSON.parse(body);
  const validationResult = reviewsFeedSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new Error(
      `Reviews API response validation failed: ${validationResult.error.message}`
    );
  }
  const data = validationResult.data;
  const entries = ensureArray(data.feed?.entry);
  const reviewEntries = entries.filter((entry) => entry["im:rating"]?.label);
  return reviewEntries.map((entry) => ({
    id: entry.id?.label || "",
    userName: entry.author?.name?.label || "",
    userUrl: entry.author?.uri?.label || "",
    version: entry["im:version"]?.label || "",
    score: parseInt(entry["im:rating"]?.label || "0", 10),
    title: entry.title?.label || "",
    text: entry.content?.label || "",
    updated: entry.updated?.label || ""
  }));
}
async function similar(options) {
  validateRequiredField(options, ["id", "appId"], "Either id or appId is required");
  const { appId, country = "us", lang, requestOptions } = options;
  let { id } = options;
  if (appId && !id) {
    const appData = await app({ appId, country, requestOptions });
    id = appData.id;
  }
  if (!id) {
    throw new Error("Could not resolve app id");
  }
  const url = `https://apps.apple.com/${country}/app/id${id}`;
  let body;
  try {
    body = await doRequest(url, requestOptions);
  } catch (error) {
    return [];
  }
  const $ = cheerio__namespace.load(body);
  const similarIds = [];
  $('a[href*="/app/"]').each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      const match = href.match(/\/id(\d+)/);
      if (match && match[1]) {
        const appId2 = parseInt(match[1], 10);
        if (!similarIds.includes(appId2) && appId2 !== id) {
          similarIds.push(appId2);
        }
      }
    }
  });
  if (similarIds.length === 0) {
    return [];
  }
  return lookup(similarIds, "id", country, lang, requestOptions);
}
async function suggest(options) {
  const { term, requestOptions } = options;
  if (!term) {
    throw new Error("term is required");
  }
  const url = `https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints?clientApplication=Software&term=${encodeURIComponent(term)}`;
  const body = await doRequest(url, requestOptions);
  const parser = new fastXmlParser.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  const parsedData = parser.parse(body);
  const validationResult = suggestResponseSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new Error(
      `Suggest API response validation failed: ${validationResult.error.message}`
    );
  }
  const result = validationResult.data;
  const arrayData = result.plist?.dict?.array;
  if (!arrayData || typeof arrayData === "string" || !arrayData.dict) {
    return [];
  }
  const dicts = arrayData.dict || [];
  const suggestions = [];
  for (const dict of dicts) {
    const strings = Array.isArray(dict.string) ? dict.string : [dict.string];
    const term2 = strings[0];
    if (term2) {
      suggestions.push({ term: term2 });
    }
  }
  return suggestions;
}
async function privacy(options) {
  const { id, country = "us", requestOptions } = options;
  if (!id) {
    throw new Error("id is required");
  }
  const appPageUrl = `https://apps.apple.com/${country}/app/id${id}`;
  const appPageBody = await doRequest(appPageUrl, requestOptions);
  const $ = cheerio__namespace.load(appPageBody);
  let privacyPolicyUrl;
  $('dialog[data-testid="dialog"] a[data-test-id="external-link"]').each((_, el) => {
    const ariaLabel = $(el).attr("aria-label");
    if (ariaLabel && ariaLabel.includes("Privacy Policy")) {
      privacyPolicyUrl = $(el).attr("href");
      return false;
    }
    return;
  });
  const privacyTypes = [];
  $('dialog[data-testid="dialog"] section.purpose-section').each((_, section) => {
    const $section = $(section);
    const purpose = $section.find("h3").text().trim();
    $section.find("li.purpose-category").each((_2, category2) => {
      const $category = $(category2);
      const categoryName = $category.find(".category-title").text().trim();
      const dataTypes = [];
      $category.find(".privacy-data-types li").each((_3, li) => {
        dataTypes.push($(li).text().trim());
      });
      if (categoryName && dataTypes.length > 0) {
        privacyTypes.push({
          privacyType: categoryName,
          name: categoryName,
          description: `Used for ${purpose}`,
          dataCategories: dataTypes,
          purposes: [purpose]
        });
      }
    });
  });
  const result = {};
  if (privacyPolicyUrl) {
    result.privacyPolicyUrl = privacyPolicyUrl;
  }
  if (privacyTypes.length > 0) {
    result.privacyTypes = privacyTypes;
  }
  return result;
}
async function versionHistory(options) {
  const { id, country = "us", requestOptions } = options;
  if (!id) {
    throw new Error("id is required");
  }
  const appPageUrl = `https://apps.apple.com/${country}/app/id${id}`;
  const appPageBody = await doRequest(appPageUrl, requestOptions);
  const $ = cheerio__namespace.load(appPageBody);
  const versions = [];
  $('dialog[data-testid="dialog"] article.svelte-13339ih').each((_, element) => {
    const $article = $(element);
    const releaseNotes = $article.find("p.svelte-13339ih").text().trim();
    const versionDisplay = $article.find("h4.svelte-13339ih").text().trim();
    const releaseDateRaw = $article.find("time").attr("datetime") || "";
    versions.push({
      versionDisplay,
      releaseDate: releaseDateRaw,
      releaseNotes: releaseNotes || void 0
    });
  });
  return versions;
}

exports.app = app;
exports.category = category;
exports.collection = collection;
exports.developer = developer;
exports.device = device;
exports.list = list;
exports.markets = markets;
exports.privacy = privacy;
exports.ratings = ratings;
exports.reviews = reviews;
exports.search = search;
exports.similar = similar;
exports.sort = sort;
exports.suggest = suggest;
exports.versionHistory = versionHistory;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map