import { it } from 'vitest';

/**
 * Marks a test that hits Apple's live endpoints (itunes.apple.com /
 * apps.apple.com).
 *
 * These are **skipped by default** — including on pull-request CI — because
 * shared CI runner IPs (GitHub-hosted runners egress from Azure datacenter
 * ranges) are aggressively rate-limited (HTTP 429) by Apple, which makes them
 * flaky and unable to gate merges reliably.
 *
 * They run only when `RUN_NETWORK_TESTS=1` is set, which the weekly workflow
 * does. Run them locally with:
 *
 * ```sh
 * npm run test:network
 * ```
 */
export const itNetwork: ReturnType<typeof it.runIf> = it.runIf(
  process.env.RUN_NETWORK_TESTS === '1'
);
