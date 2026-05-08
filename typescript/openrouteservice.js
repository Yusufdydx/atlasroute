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
exports.OpenRouteServiceUtilities = void 0;
const axios_1 = __importDefault(require("axios"));
const api_config_1 = require("./api-config");
exports.OpenRouteServiceUtilities = {
    calculateRoute(start, end, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!api_config_1.ApiConfig.openRouteServiceApiKey) {
                throw new Error("OpenRouteService API key is not configured");
            }
            const profile = (options === null || options === void 0 ? void 0 : options.profile) || "driving-car";
            try {
                const response = yield axios_1.default.post(`https://api.openrouteservice.org/v2/directions/${profile}`, {
                    coordinates: [
                        [start.longitude, start.latitude],
                        [end.longitude, end.latitude],
                    ],
                    format: (options === null || options === void 0 ? void 0 : options.format) || "geojson",
                }, {
                    headers: {
                        Authorization: api_config_1.ApiConfig.openRouteServiceApiKey,
                        "Content-Type": "application/json",
                    },
                });
                const data = response.data;
                if (!data.routes || data.routes.length === 0) {
                    return null;
                }
                const route = data.routes[0];
                const steps = (route.segments || []).flatMap((segment) => (segment.steps || []).map((step) => {
                    var _a, _b;
                    return ({
                        distance: step.distance,
                        duration: step.duration,
                        instruction: ((_a = step.instruction) === null || _a === void 0 ? void 0 : _a.text) || ((_b = step.way_points) === null || _b === void 0 ? void 0 : _b.join(" → ")) || "",
                        streetName: step.name || "Unknown",
                    });
                }));
                return {
                    distance: (_b = (_a = route.summary) === null || _a === void 0 ? void 0 : _a.distance) !== null && _b !== void 0 ? _b : route.distance,
                    duration: (_d = (_c = route.summary) === null || _c === void 0 ? void 0 : _c.duration) !== null && _d !== void 0 ? _d : route.duration,
                    geometry: route.geometry,
                    summary: {
                        distance: (_f = (_e = route.summary) === null || _e === void 0 ? void 0 : _e.distance) !== null && _f !== void 0 ? _f : route.distance,
                        duration: (_h = (_g = route.summary) === null || _g === void 0 ? void 0 : _g.duration) !== null && _h !== void 0 ? _h : route.duration,
                    },
                    steps,
                };
            }
            catch (error) {
                console.error("OpenRouteService API error:", error);
                return null;
            }
        });
    },
    getDistance(start, end, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (!api_config_1.ApiConfig.openRouteServiceApiKey) {
                throw new Error("OpenRouteService API key is not configured");
            }
            const routeProfile = profile || "driving-car";
            try {
                const response = yield axios_1.default.post(`https://api.openrouteservice.org/v2/directions/${routeProfile}`, {
                    coordinates: [
                        [start.longitude, start.latitude],
                        [end.longitude, end.latitude],
                    ],
                }, {
                    headers: {
                        Authorization: api_config_1.ApiConfig.openRouteServiceApiKey,
                        "Content-Type": "application/json",
                    },
                });
                const data = response.data;
                if (!data.routes || data.routes.length === 0) {
                    return null;
                }
                const route = data.routes[0];
                return {
                    from: start,
                    to: end,
                    distance: (_b = (_a = route.summary) === null || _a === void 0 ? void 0 : _a.distance) !== null && _b !== void 0 ? _b : route.distance,
                    duration: (_d = (_c = route.summary) === null || _c === void 0 ? void 0 : _c.duration) !== null && _d !== void 0 ? _d : route.duration,
                };
            }
            catch (error) {
                console.error("OpenRouteService API error:", error);
                return null;
            }
        });
    },
    getMatrix(locations, profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!api_config_1.ApiConfig.openRouteServiceApiKey) {
                throw new Error("OpenRouteService API key is not configured");
            }
            const routeProfile = profile || "driving-car";
            try {
                const coordinates = locations.map((loc) => [loc.longitude, loc.latitude]);
                const response = yield axios_1.default.post(`https://api.openrouteservice.org/v2/matrix/${routeProfile}`, {
                    locations: coordinates,
                    metrics: ["distance", "duration"],
                }, {
                    headers: {
                        Authorization: api_config_1.ApiConfig.openRouteServiceApiKey,
                        "Content-Type": "application/json",
                    },
                });
                return {
                    distances: response.data.distances,
                    durations: response.data.durations,
                };
            }
            catch (error) {
                console.error("OpenRouteService matrix API error:", error);
                return null;
            }
        });
    },
    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)} seconds`;
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} minutes`;
    },
    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        const km = meters / 1000;
        if (km < 10) {
            return `${km.toFixed(1)}km`;
        }
        return `${Math.round(km)}km`;
    },
};
