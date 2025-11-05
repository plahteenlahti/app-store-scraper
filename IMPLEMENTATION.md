# @perttu/app-store-scraper Implementation Summary

## Overview

This is a complete modern TypeScript rewrite of [facundoolano/app-store-scraper](https://github.com/facundoolano/app-store-scraper) with full type safety, modern dependencies, and improved developer experience.

## What Was Built

### 1. Project Setup & Configuration

- **TypeScript 5.3** with strict type checking enabled
- **tsup** for fast, dual ESM/CJS builds
- **Vitest** for testing
- **ESLint + Prettier** for code quality
- **Node.js 18+** as minimum requirement

### 2. Type System

Complete TypeScript interfaces covering all API responses:

**Core Types** ([src/types/](src/types/)):
- `App` - Complete app metadata with 30+ properties
- `Review` - User review structure
- `VersionHistory` - App version history
- `PrivacyDetails` - Privacy policy information
- `RatingHistogram` - 1-5 star rating distribution
- `Suggestion` - Search autocomplete suggestions

**Options Types**:
- `AppOptions`, `ListOptions`, `SearchOptions`, etc.
- All with JSDoc documentation
- Proper optional/required field marking

**Constants** ([src/types/constants.ts](src/types/constants.ts)):
- `collection` - 13 collection types (TOP_FREE_IOS, TOP_PAID_IPAD, etc.)
- `category` - 80+ app categories including subcategories
- `sort` - Review sorting options (RECENT, HELPFUL)
- `device` - Device type filters
- `markets` - 140+ country code mappings

### 3. Core Implementation

**Utility Functions** ([src/lib/common.ts](src/lib/common.ts)):
- `doRequest()` - HTTP request wrapper using undici
- `cleanApp()` - Transforms iTunes API responses to our App type
- `lookup()` - Batch lookup apps by ID/bundleId/artistId
- `storeId()` - Maps country codes to Apple Store IDs
- `ensureArray()` - Array normalization helper
- `validateRequiredField()` - Field validation helper

**API Methods** ([src/lib/](src/lib/)):

1. **app()** - Get detailed app information
   - Supports both trackId and bundleId lookup
   - Optional ratings histogram inclusion
   - Full type safety on response

2. **list()** - Get curated app lists
   - 13 collection types (top free, paid, grossing)
   - Filter by 80+ categories
   - Optional full details fetch
   - Up to 200 apps per request

3. **search()** - Search for apps
   - Keyword search
   - Pagination support (page + num)
   - Optional ID-only mode for performance
   - Multi-region support

4. **developer()** - Get all apps from a developer
   - Lookup by developer ID (artistId)
   - Returns all published apps

5. **reviews()** - Get user reviews
   - Supports both trackId and bundleId
   - Pagination (1-10 pages)
   - Sort by recent or helpful
   - Multi-region support

6. **ratings()** - Get rating distribution
   - Returns 1-5 star histogram
   - HTML scraping with cheerio
   - Handles various page formats

7. **similar()** - Get similar/related apps
   - "Customers Also Bought" section
   - Regex extraction from HTML
   - Returns full app details

8. **suggest()** - Get search suggestions
   - Autocomplete functionality
   - XML plist parsing
   - Fast typeahead support

9. **privacy()** - Get privacy policy details
   - Two-step token-based auth
   - AMP API integration
   - Privacy manifest data

10. **versionHistory()** - Get version history
    - Release notes and dates
    - Two-step token-based auth
    - AMP API integration

### 4. Dependency Modernization

**Replaced Deprecated Packages**:
- ❌ `request` (deprecated) → ✅ `undici` (modern, fast, Node.js standard)
- ❌ `xml2js` → ✅ `fast-xml-parser` (faster, better types)
- ❌ `ramda` → ✅ Native array methods (smaller bundle)
- ❌ `throttled-request` → ✅ Not implemented yet (can add `p-throttle` later)
- ❌ `memoizee` → ✅ Not implemented yet (can add `p-memoize` later)
- ✅ `cheerio` → Still using (best for HTML parsing)

**Current Dependencies**:
```json
{
  "cheerio": "^1.0.0-rc.12",
  "fast-xml-parser": "^4.3.2",
  "undici": "^6.0.0"
}
```

### 5. Build Output

Dual package support with proper type declarations:

```
dist/
├── index.js         # ESM bundle (17KB)
├── index.js.map     # ESM source map
├── index.cjs        # CommonJS bundle (18KB)
├── index.cjs.map    # CJS source map
├── index.d.ts       # TypeScript declarations (16KB)
└── index.d.cts      # CJS TypeScript declarations
```

**Package Exports**:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Key Improvements Over Original

### Type Safety
- **100% TypeScript** with strict mode enabled
- **IntelliSense support** for all methods and options
- **Compile-time error detection**
- **Self-documenting types** with JSDoc comments

### Modern JavaScript
- **Async/await** instead of promise chains
- **ESM modules** with .js extensions
- **Native array methods** instead of Ramda
- **Optional chaining** (?.) throughout

### Better Developer Experience
- **Tree-shakeable exports** for optimal bundle size
- **Source maps** for debugging
- **Prettier formatting** consistency
- **ESLint** for code quality

### Performance
- **undici** is faster than deprecated `request`
- **fast-xml-parser** is faster than `xml2js`
- **Smaller bundle** without Ramda

## File Structure

```
@perttu/app-store-scraper/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── app.ts          # App & RatingHistogram types
│   │   ├── review.ts       # Review, VersionHistory, Privacy types
│   │   ├── options.ts      # All method options types
│   │   ├── constants.ts    # Constants and enums
│   │   └── index.ts        # Type exports
│   ├── lib/                # Core implementation
│   │   ├── common.ts       # Shared utilities
│   │   ├── app.ts          # app() method
│   │   ├── list.ts         # list() method
│   │   ├── search.ts       # search() method
│   │   ├── developer.ts    # developer() method
│   │   ├── reviews.ts      # reviews() method
│   │   ├── ratings.ts      # ratings() method
│   │   ├── similar.ts      # similar() method
│   │   ├── suggest.ts      # suggest() method
│   │   ├── privacy.ts      # privacy() method
│   │   └── version-history.ts  # versionHistory() method
│   └── index.ts            # Main entry point
├── dist/                   # Build output (ESM + CJS + types)
├── examples/               # Usage examples
├── temp-original/          # Original repo for reference
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .eslintrc.cjs
├── .prettierrc.json
└── README.md
```

## Usage Example

```typescript
import { app, search, collection, category } from '@perttu/app-store-scraper';

// Get app details
const appData = await app({ id: 553834731 });
console.log(appData.title, appData.developer);

// Search for apps
const results = await search({ term: 'minecraft', num: 10 });

// Get top free games
const games = await list({
  collection: collection.TOP_FREE_IOS,
  category: category.GAMES,
  num: 50,
});
```

## Testing Status

- ⏳ **Test suite not yet implemented**
- Original repo has comprehensive integration tests
- Next step: Port tests to Vitest with TypeScript

## Not Yet Implemented

1. **Memoization** - Can add `p-memoize` wrapper around methods
2. **Rate limiting** - Can add `p-throttle` support
3. **Tests** - Need to port from original repo
4. **CI/CD** - GitHub Actions for automated testing
5. **Publishing** - npm package publishing workflow

## Migration from Original

The API is intentionally kept compatible:

```javascript
// Original (JavaScript)
const store = require('app-store-scraper');
store.app({ id: 123 }).then(console.log);

// New (TypeScript)
import { app } from '@perttu/app-store-scraper';
const data = await app({ id: 123 });
console.log(data);
```

Key differences:
- Named exports instead of default export
- Native promises/async-await (no callback support)
- TypeScript types available
- ESM preferred over CommonJS

## Build Commands

```bash
# Install dependencies
npm install

# Build (ESM + CJS + types)
npm run build

# Type check only
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Test (not implemented yet)
npm test
```

## Next Steps

1. **Add tests** - Port original test suite to Vitest
2. **Add memoization** - Optional caching layer with `p-memoize`
3. **Add rate limiting** - Optional throttling with `p-throttle`
4. **CI/CD setup** - GitHub Actions for testing + publishing
5. **Documentation** - More examples and API docs
6. **npm publish** - Publish to npm registry

## License

MIT (same as original)
