/**
 * Zod schemas for runtime validation of API responses
 */
import { z } from 'zod';

/**
 * iTunes API app response schema
 */
export const iTunesAppResponseSchema = z.object({
  wrapperType: z.string().optional(),
  kind: z.string().optional(),
  trackId: z.number().optional(),
  bundleId: z.string().optional(),
  trackName: z.string().optional(),
  trackViewUrl: z.string().optional(),
  description: z.string().optional(),
  artworkUrl512: z.string().optional(),
  artworkUrl100: z.string().optional(),
  genres: z.array(z.string()).optional(),
  genreIds: z.array(z.string()).optional(),
  primaryGenreName: z.string().optional(),
  primaryGenreId: z.number().optional(),
  contentAdvisoryRating: z.string().optional(),
  languageCodesISO2A: z.array(z.string()).optional(),
  fileSizeBytes: z.string().optional(),
  minimumOsVersion: z.string().optional(),
  releaseDate: z.string().optional(),
  currentVersionReleaseDate: z.string().optional(),
  releaseNotes: z.string().optional(),
  version: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  artistId: z.number().optional(),
  artistName: z.string().optional(),
  artistViewUrl: z.string().optional(),
  sellerUrl: z.string().optional(),
  averageUserRating: z.number().optional(),
  userRatingCount: z.number().optional(),
  averageUserRatingForCurrentVersion: z.number().optional(),
  userRatingCountForCurrentVersion: z.number().optional(),
  screenshotUrls: z.array(z.string()).optional(),
  ipadScreenshotUrls: z.array(z.string()).optional(),
  appletvScreenshotUrls: z.array(z.string()).optional(),
  supportedDevices: z.array(z.string()).optional(),
}).passthrough();

export type ITunesAppResponse = z.infer<typeof iTunesAppResponseSchema>;

/**
 * iTunes lookup API response schema
 */
export const iTunesLookupResponseSchema = z.object({
  resultCount: z.number(),
  results: z.array(iTunesAppResponseSchema),
});

export type ITunesLookupResponse = z.infer<typeof iTunesLookupResponseSchema>;

/**
 * RSS feed entry schema for lists
 */
export const rssFeedEntrySchema = z.object({
  id: z
    .object({
      attributes: z
        .object({
          'im:id': z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const rssFeedSchema = z.object({
  feed: z
    .object({
      entry: z.array(rssFeedEntrySchema).optional(),
    })
    .optional(),
});

export type RSSFeed = z.infer<typeof rssFeedSchema>;

/**
 * Review entry schema
 */
export const reviewEntrySchema = z.object({
  author: z
    .object({
      uri: z
        .object({
          label: z.string().optional(),
        })
        .optional(),
      name: z
        .object({
          label: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  'im:version': z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  'im:rating': z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  'im:voteSum': z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  'im:voteCount': z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  title: z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  content: z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  id: z
    .object({
      label: z.string().optional(),
    })
    .optional(),
  updated: z
    .object({
      label: z.string().optional(),
    })
    .optional(),
});

export const reviewsFeedSchema = z.object({
  feed: z
    .object({
      entry: z.union([reviewEntrySchema, z.array(reviewEntrySchema)]).optional(),
    })
    .optional(),
});

export type ReviewEntry = z.infer<typeof reviewEntrySchema>;
export type ReviewsFeed = z.infer<typeof reviewsFeedSchema>;

/**
 * Suggestion response schema
 */
export const suggestDictSchema = z.object({
  string: z.union([z.string(), z.array(z.string())]).optional(),
});

export const suggestResponseSchema = z.object({
  plist: z
    .object({
      dict: z
        .object({
          array: z
            .union([
              z.string(),
              z.object({
                dict: z.array(suggestDictSchema).optional(),
              }),
            ])
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export type SuggestResponse = z.infer<typeof suggestResponseSchema>;

/**
 * Privacy details schema
 */
export const privacyTypeSchema = z.object({
  privacyType: z.string().optional(),
  identifier: z.string().optional(),
  description: z.string().optional(),
  dataCategories: z.array(z.string()).optional(),
  purposes: z.array(z.string()).optional(),
});

export const privacyDetailsSchema = z.object({
  managePrivacyChoicesUrl: z.string().optional(),
  privacyPolicyUrl: z.string().optional(),
  privacyPolicyText: z.string().optional(),
  privacyTypes: z.array(privacyTypeSchema).optional(),
});

export const ampApiResponseSchema = z.object({
  data: z
    .array(
      z.object({
        attributes: z
          .object({
            privacyDetails: privacyDetailsSchema.optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

export type AmpApiResponse = z.infer<typeof ampApiResponseSchema>;

/**
 * Version history schema
 */
export const versionHistoryEntrySchema = z.object({
  versionDisplay: z.string().optional(),
  releaseDate: z.string().optional(),
  releaseNotes: z.string().optional(),
});

export const versionHistoryResponseSchema = z.object({
  data: z
    .array(
      z.object({
        attributes: z
          .object({
            platformAttributes: z
              .object({
                ios: z
                  .object({
                    versionHistory: z.array(versionHistoryEntrySchema).optional(),
                  })
                  .optional(),
              })
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

export type VersionHistoryResponse = z.infer<typeof versionHistoryResponseSchema>;

/**
 * Similar apps response schema (array of app IDs)
 */
export const similarAppsSchema = z.array(z.number());

export type SimilarApps = z.infer<typeof similarAppsSchema>;
