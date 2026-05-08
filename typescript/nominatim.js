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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominatimUtilities = void 0;
const axios_1 = __importDefault(require("axios"));
const api_config_1 = require("./api-config");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.NominatimUtilities = {
    geocode(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sleep(api_config_1.ApiConfig.rateLimitDelay);
            const params = new URLSearchParams({
                q: query,
                format: "json",
                addressdetails: "1",
                limit: String((options === null || options === void 0 ? void 0 : options.limit) || 5),
            });
            if (options === null || options === void 0 ? void 0 : options.countrycodes) {
                params.append("countrycodes", options.countrycodes);
            }
            const response = yield axios_1.default.get(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
                headers: {
                    "User-Agent": api_config_1.ApiConfig.nominatimUserAgent,
                    "Accept-Language": "en",
                },
            });
            return response.data.map((result) => ({
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                displayName: result.display_name,
                address: result.address
                    ? {
                        road: result.address.road,
                        city: result.address.city || result.address.town || result.address.village,
                        town: result.address.town,
                        village: result.address.village,
                        state: result.address.state,
                        country: result.address.country,
                        postcode: result.address.postcode,
                        houseNumber: result.address.house_number,
                    }
                    : undefined,
                type: result.type,
            }));
        });
    },
    reverseGeocode(latitude, longitude) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sleep(api_config_1.ApiConfig.rateLimitDelay);
            const params = new URLSearchParams({
                lat: String(latitude),
                lon: String(longitude),
                format: "json",
                addressdetails: "1",
            });
            try {
                const response = yield axios_1.default.get(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
                    headers: {
                        "User-Agent": api_config_1.ApiConfig.nominatimUserAgent,
                        "Accept-Language": "en",
                    },
                });
                return {
                    latitude: parseFloat(response.data.lat),
                    longitude: parseFloat(response.data.lon),
                    displayName: response.data.display_name,
                    address: response.data.address
                        ? {
                            road: response.data.address.road,
                            city: response.data.address.city ||
                                response.data.address.town ||
                                response.data.address.village,
                            town: response.data.address.town,
                            village: response.data.address.village,
                            state: response.data.address.state,
                            country: response.data.address.country,
                            postcode: response.data.address.postcode,
                            houseNumber: response.data.address.house_number,
                        }
                        : undefined,
                    type: response.data.type,
                };
            }
            catch (_a) {
                return null;
            }
        });
    },
};
