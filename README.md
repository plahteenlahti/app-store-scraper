# @perttu/app-store-scraper

Modern TypeScript library to scrape application data from the iTunes/Mac App Store.

This is a complete TypeScript rewrite of [facundoolano/app-store-scraper](https://github.com/facundoolano/app-store-scraper) with full type safety and modern dependencies.

## Features

- 🎯 **Full TypeScript support** with comprehensive type definitions
- 🔄 **Modern dependencies** (no deprecated packages)
- 📦 **Dual ESM/CJS support** for maximum compatibility
- 🌍 **Multi-region support** with 140+ country codes
- 🎨 **Tree-shakeable** exports for optimal bundle size

> **Want rate limiting or memoization?** See this blog post: [Throttling and memoizing App Store scraper calls](https://perttu.dev/articles/throttling-and-memoing-app-store-scraping)

## Comparison with the original

This library started as a TypeScript rewrite of [`facundoolano/app-store-scraper`](https://github.com/facundoolano/app-store-scraper) (last published as `0.18.0`), but it's **more than a type conversion**. Apple has changed several endpoints since the original was last updated, and the methods that broke as a result have been repaired here.

| | `@perttu/app-store-scraper` | `facundoolano/app-store-scraper` |
| --- | --- | --- |
| Language | TypeScript | JavaScript |
| Type definitions | Built in | Community `@types` package |
| Module format | ESM **and** CommonJS | CommonJS only |
| HTTP client | Native `fetch` | Deprecated [`request`](https://github.com/request/request/issues/3142) |
| Runtime validation | Yes — [Zod](https://zod.dev) schemas | None |
| Dependencies | Minimal, no deprecated packages | `request`, `ramda`, `xml2js`, `memoizee`, `throttled-request`, `debug` |
| Throttling / memoization | Not bundled — see the [post above](https://perttu.dev/articles/throttling-and-memoing-app-store-scraping) | Built in |

### Method status

Every method has been checked against Apple's current endpoints. The ones marked **Fixed** had broken (in the upstream library, or against today's App Store) and were repaired:

| Method | Status | Notes |
| --- | --- | --- |
| `app()` | ✅ Working | Falls back to scraping the App Store page for screenshots when the iTunes API returns none |
| `search()` | 🔧 Fixed | Uses the official iTunes Search API; pagination past page 1 works |
| `list()` | ✅ Working | |
| `developer()` | 🔧 Fixed | Repaired lookup and updated schemas |
| `reviews()` | 🔧 Fixed | Uses Apple's XML review feed with a non-browser agent — the JSON feed now returns no entries |
| `ratings()` | 🔧 Fixed | Reworked to return the correct histogram and a total count that survives thousands separators |
| `similar()` | 🔧 Fixed | Rebuilt on native `fetch` and current scraping |
| `suggest()` | 🔧 Fixed | Repaired against Apple's current hints endpoint |
| `privacy()` | 🔧 Fixed | Repaired privacy-details scraping |
| `versionHistory()` | 🔧 Fixed | Repaired against Apple's current endpoint |

## Installation

```bash
npm install @perttu/app-store-scraper
```

## Usage

```typescript
import { app, search, list, reviews, collection, category } from '@perttu/app-store-scraper';

// Get app details
const appData = await app({ id: 553834731 });

// Search for apps
const results = await search({ term: 'minecraft', num: 10 });

// Get top free games
const games = await list({
  collection: collection.TOP_FREE_IOS,
  category: category.GAMES,
  num: 50,
});

// Get reviews
const appReviews = await reviews({ id: 553834731, page: 1 });
```

**📖 See [examples/all-methods.ts](examples/all-methods.ts) for comprehensive examples of all 10 API methods.**

## API

### Methods

- `app()` - Get detailed app information
- `list()` - Get curated app lists from collections. Returns full `App` objects by default; pass `fullDetail: false` for lightweight `ListApp` records parsed from the chart feed in a single request
- `search()` - Search for apps by keyword
- `developer()` - Get all apps from a developer
- `reviews()` - Get user reviews for an app
- `ratings()` - Get rating distribution histogram
- `similar()` - Get similar/related apps
- `suggest()` - Get search suggestions
- `privacy()` - Get privacy policy details
- `versionHistory()` - Get version release history

### Constants

- `collection` - App Store collections (TOP_FREE_IOS, etc.)
- `category` - App categories (GAMES, BUSINESS, etc.)
- `sort` - Sort options for reviews (RECENT, HELPFUL)
- `device` - Device types (IPAD, MAC, ALL)

### Request options

Every method accepts `requestOptions` to control the underlying HTTP request.
Apple rate-limits (HTTP 429) and occasionally 5xxs under load, so retries and a
timeout are the main knobs for scraping reliably at scale:

```typescript
const app1 = await app({
  id: 553834731,
  requestOptions: {
    timeout: 5000,        // abort a request after 5s (per attempt)
    retries: 3,           // retry up to 3× on 429 / 5xx / network errors
    retryDelay: 500,      // base backoff in ms, doubles each attempt; Retry-After wins
    signal: controller.signal, // AbortSignal to cancel (no further retries)
    fetch: myProxiedFetch,     // custom fetch, e.g. bound to a proxy agent
    headers: { 'X-Custom': '1' },
  },
});
```

| Option | Default | Notes |
| --- | --- | --- |
| `timeout` | none | Milliseconds; each retry attempt gets a fresh timeout |
| `retries` | `0` | Retries after HTTP 429, HTTP 5xx, or a network/timeout error |
| `retryDelay` | `500` | Base backoff in ms; grows as `retryDelay * 2^attempt`. A `Retry-After` header takes precedence |
| `signal` | none | Cancels the request; an aborted signal is never retried |
| `fetch` | global `fetch` | Inject a proxied/instrumented fetch |
| `headers` | — | Merged over the default headers |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run example (tests all methods)
npm run example

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format
```

### Testing

Tests are split into two groups:

- **Unit tests** run against mocked `fetch` and are deterministic. These run on
  every pull request.

  ```bash
  npm run test:run
  ```

- **Live-network tests** hit Apple's real endpoints. They are **skipped by
  default** because shared CI runner IPs get rate-limited (HTTP 429) by Apple,
  so they run on a weekly schedule rather than gating PRs. Run them locally
  (sets `RUN_NETWORK_TESTS=1`) with:

  ```bash
  npm run test:network
  ```

## License

MIT
