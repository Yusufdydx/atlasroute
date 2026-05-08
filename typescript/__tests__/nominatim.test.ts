import { NominatimUtilities } from '../nominatim';

describe('NominatimUtilities', () => {
  describe('geocode', () => {
    it('should return array of geocoding results for valid location', async () => {
      const results = await NominatimUtilities.geocode('New York', { limit: 1 });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle invalid/empty location gracefully', async () => {
      const results = await NominatimUtilities.geocode('');
      expect(Array.isArray(results)).toBe(true);
    }, 30000);
  });

  describe('reverseGeocode', () => {
    it('should return geocoding result for valid coordinates', async () => {
      const result = await NominatimUtilities.reverseGeocode(40.7128, -74.006);
      expect(result).toBeDefined();
    }, 30000);
  });
});