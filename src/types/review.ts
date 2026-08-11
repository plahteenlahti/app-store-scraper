/**
 * Represents a user review from the App Store
 */
export interface Review {
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
  /** Sum of helpful votes (can be negative if more "not helpful" votes) */
  voteSum: number;
  /** Total number of votes (helpful + not helpful) */
  voteCount: number;
}

/**
 * Represents version history information
 */
export interface VersionHistory {
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
export interface Suggestion {
  /** Suggested search term */
  term: string;
}

/**
 * Represents privacy details
 */
export interface PrivacyDetails {
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
export interface PrivacyType {
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
