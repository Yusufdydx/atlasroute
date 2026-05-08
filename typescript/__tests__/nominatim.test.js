"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nominatim_1 = require("../nominatim");
describe('NominatimUtilities', () => {
    describe('geocode', () => {
        it('should return array of geocoding results for valid location', () => __awaiter(void 0, void 0, void 0, function* () {
            const results = yield nominatim_1.NominatimUtilities.geocode('New York', { limit: 1 });
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
        }), 30000);
        it('should handle invalid/empty location gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const results = yield nominatim_1.NominatimUtilities.geocode('');
            expect(Array.isArray(results)).toBe(true);
        }), 30000);
    });
    describe('reverseGeocode', () => {
        it('should return geocoding result for valid coordinates', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield nominatim_1.NominatimUtilities.reverseGeocode(40.7128, -74.006);
            expect(result).toBeDefined();
        }), 30000);
    });
});
