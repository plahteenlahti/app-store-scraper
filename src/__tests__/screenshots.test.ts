import { describe, expect } from 'vitest';
import { itNetwork } from './helpers.js';
import { app } from '../lib/app.js';

describe('screenshots', () => {
  // Test with the specified app ID 6756671942 (Bygone - Yesterday's Weather)
  // Note: This app's screenshots are not available via iTunes API but are scraped from the App Store page
  describe('app ID 6756671942 (Bygone - scraped screenshots)', () => {
    itNetwork('should fetch app and return screenshot arrays', { timeout: 15000 }, async () => {
      const result = await app({ id: 6756671942 });

      expect(result).toBeDefined();
      expect(result.id).toBe(6756671942);
      expect(result.title).toBe('Bygone - Yesterday\'s Weather');

      // Verify screenshots arrays exist
      expect(result.screenshots).toBeDefined();
      expect(Array.isArray(result.screenshots)).toBe(true);

      expect(result.ipadScreenshots).toBeDefined();
      expect(Array.isArray(result.ipadScreenshots)).toBe(true);

      expect(result.appletvScreenshots).toBeDefined();
      expect(Array.isArray(result.appletvScreenshots)).toBe(true);
    });

    itNetwork('should scrape screenshots when iTunes API returns empty arrays', { timeout: 15000 }, async () => {
      const result = await app({ id: 6756671942 });

      // This app has screenshots on the App Store page but not via iTunes API
      // Our fallback scraping should find them
      expect(result.screenshots.length).toBeGreaterThan(0);

      // Verify the screenshot URLs are valid
      // Apple's scraped CDN URLs end in a render-transform suffix (e.g. 320x480bb.jpg),
      // not necessarily .png, so accept the image formats Apple actually serves.
      result.screenshots.forEach((url) => {
        expect(url).toMatch(/^https:\/\/is\d+-ssl\.mzstatic\.com/);
        expect(url).toMatch(/\.(png|jpe?g|webp)$/i);
      });
    });

    itNetwork('should have accessible screenshot URLs from scraping', { timeout: 30000 }, async () => {
      const result = await app({ id: 6756671942 });

      // Test that the scraped screenshot URL is accessible
      const screenshotUrl = result.screenshots[0];
      expect(screenshotUrl).toBeDefined();

      if (screenshotUrl) {
        const response = await fetch(screenshotUrl, { method: 'HEAD' });
        expect(response.ok).toBe(true);
        expect(response.headers.get('content-type')).toMatch(/image\//);
      }
    });
  });

  // Test with an app that HAS screenshots (Minecraft)
  describe('app with screenshots (Minecraft)', () => {
    itNetwork('should fetch screenshots for Minecraft app', { timeout: 15000 }, async () => {
      const result = await app({ id: 479516143 });

      expect(result.screenshots).toBeDefined();
      expect(Array.isArray(result.screenshots)).toBe(true);
      expect(result.screenshots.length).toBeGreaterThan(0);

      // Minecraft should have iPhone screenshots
      expect(result.screenshots.length).toBeGreaterThanOrEqual(1);
    });

    itNetwork('should have valid screenshot URLs', { timeout: 15000 }, async () => {
      const result = await app({ id: 479516143 });

      // Validate iPhone screenshots
      result.screenshots.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
        expect(url).toMatch(/mzstatic\.com/);
      });

      // Validate iPad screenshots if present
      if (result.ipadScreenshots.length > 0) {
        result.ipadScreenshots.forEach((url) => {
          expect(url).toMatch(/^https:\/\//);
          expect(url).toMatch(/mzstatic\.com/);
        });
      }
    });

    itNetwork('should have screenshots that are accessible', { timeout: 30000 }, async () => {
      const result = await app({ id: 479516143 });

      // Test at least one screenshot URL is accessible
      const screenshotUrl = result.screenshots[0];

      expect(screenshotUrl).toBeDefined();

      if (screenshotUrl) {
        const response = await fetch(screenshotUrl, { method: 'HEAD' });
        expect(response.ok).toBe(true);
        expect(response.headers.get('content-type')).toMatch(/image\//);
      }
    });

    itNetwork('should return screenshot arrays are always defined', { timeout: 15000 }, async () => {
      const result = await app({ id: 479516143 });

      // Even if empty, the arrays should be defined
      expect(result.screenshots).toBeDefined();
      expect(result.ipadScreenshots).toBeDefined();
      expect(result.appletvScreenshots).toBeDefined();
    });
  });

  describe('screenshot URL structure', () => {
    itNetwork('should return screenshot URLs with proper Apple CDN format', { timeout: 15000 }, async () => {
      const result = await app({ id: 479516143 });

      const allScreenshots = [
        ...result.screenshots,
        ...result.ipadScreenshots,
        ...result.appletvScreenshots
      ];

      expect(allScreenshots.length).toBeGreaterThan(0);

      // Apple uses various URL formats, but they should all be from mzstatic.com
      allScreenshots.forEach(url => {
        expect(url).toMatch(/^https:\/\/is\d+-ssl\.mzstatic\.com/);
      });
    });
  });

  describe('screenshots for different countries', () => {
    itNetwork('should fetch screenshots regardless of country', { timeout: 15000 }, async () => {
      const usResult = await app({ id: 479516143, country: 'us' });

      // Screenshots should work regardless of country
      expect(usResult.screenshots).toBeDefined();
      expect(Array.isArray(usResult.screenshots)).toBe(true);
      expect(usResult.screenshots.length).toBeGreaterThan(0);
    });
  });
});
