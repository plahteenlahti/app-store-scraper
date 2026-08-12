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
 * RSS feed entry schema for lists.
 *
 * The feed carries enough per-entry data to build a lightweight app record
 * without a follow-up lookup call (name, icon, price, developer, genre, …).
 */
const rssLabelSchema = z.object({ label: z.string().optional() });

export const rssFeedEntrySchema = z
  .object({
    'im:name': rssLabelSchema.optional(),
    'im:image': z
      .array(
        z.object({
          label: z.string().optional(),
          attributes: z.object({ height: z.string().optional() }).optional(),
        })
      )
      .optional(),
    summary: rssLabelSchema.optional(),
    'im:price': z
      .object({
        label: z.string().optional(),
        attributes: z
          .object({
            amount: z.string().optional(),
            currency: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    title: rssLabelSchema.optional(),
    id: z
      .object({
        label: z.string().optional(),
        attributes: z
          .object({
            'im:id': z.string().optional(),
            'im:bundleId': z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    'im:artist': z
      .object({
        label: z.string().optional(),
        attributes: z.object({ href: z.string().optional() }).optional(),
      })
      .optional(),
    category: z
      .object({
        attributes: z
          .object({
            'im:id': z.string().optional(),
            term: z.string().optional(),
            label: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    'im:releaseDate': rssLabelSchema.optional(),
  })
  .passthrough();

export type RSSFeedEntry = z.infer<typeof rssFeedEntrySchema>;

export const rssFeedSchema = z.object({
  feed: z
    .object({
      // Apple returns a single object (not an array) when the feed has one entry.
      entry: z
        .union([rssFeedEntrySchema, z.array(rssFeedEntrySchema)])
        .optional(),
    })
    .optional(),
});

export type RSSFeed = z.infer<typeof rssFeedSchema>;

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
