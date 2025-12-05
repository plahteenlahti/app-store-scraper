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
- `list()` - Get curated app lists from collections
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

## License

MIT
