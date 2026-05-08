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
exports.OverpassUtilities = void 0;
const axios_1 = __importDefault(require("axios"));
const api_config_1 = require("./api-config");
const amenityMapping = {
    hospital: ["emergency", "surgery", "icu", "maternity"],
    clinic: ["general", "primary_care", "vaccination"],
    pharmacy: ["medications", "prescriptions", "health_products"],
    doctor: ["general_practice", "specialist", "consultation"],
    dentist: ["dental_care", "emergency_dental"],
    optician: ["eye_care", "glasses", "contact_lenses"],
};
const getOverpassHeaders = () => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api_config_1.ApiConfig.overpassUserAgent,
        "Accept-Encoding": "identity",
    };
    if (api_config_1.ApiConfig.overpassAcceptHeader) {
        headers["Accept"] = api_config_1.ApiConfig.overpassAcceptHeader;
    }
    return headers;
};
exports.OverpassUtilities = {
    findNearbyFacilities(latitude, longitude, radius, facilityTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield new Promise((resolve) => setTimeout(resolve, api_config_1.ApiConfig.rateLimitDelay));
            const typesToSearch = facilityTypes && facilityTypes.length > 0
                ? facilityTypes
                : ["hospital", "clinic", "pharmacy", "doctors", "dentist"];
            const amenityRegex = typesToSearch.join("|");
            let query = "";
            if (facilityTypes && facilityTypes.length === 1) {
                const ft = facilityTypes[0];
                query = `[out:json][timeout:25];node["amenity"="${ft}"](around:${radius},${latitude},${longitude});way["amenity"="${ft}"](around:${radius},${latitude},${longitude});out center;`;
            }
            else if (!facilityTypes || facilityTypes.length === 0) {
                query = `[out:json][timeout:25];node["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${latitude},${longitude});way["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${latitude},${longitude});node["healthcare"](around:${radius},${latitude},${longitude});way["healthcare"](around:${radius},${latitude},${longitude});out center;`;
            }
            else {
                query = `[out:json][timeout:25];node["amenity"~"${amenityRegex}"](around:${radius},${latitude},${longitude});way["amenity"~"${amenityRegex}"](around:${radius},${latitude},${longitude});out center;`;
            }
            console.log("Overpass query:", query);
            console.log("Overpass headers:", JSON.stringify(getOverpassHeaders()));
            try {
                const params = new URLSearchParams();
                params.append("data", query);
                const response = yield axios_1.default.post(api_config_1.ApiConfig.overpassEndpoint, params, { headers: getOverpassHeaders() });
                console.log("Overpass response status:", response.status);
                console.log("Elements count:", ((_a = response.data.elements) === null || _a === void 0 ? void 0 : _a.length) || 0);
                return (response.data.elements || []).map((element) => {
                    var _a, _b, _c, _d, _e, _f;
                    const lat = (_c = (_a = element.lat) !== null && _a !== void 0 ? _a : (_b = element.center) === null || _b === void 0 ? void 0 : _b.lat) !== null && _c !== void 0 ? _c : 0;
                    const lon = (_f = (_d = element.lon) !== null && _d !== void 0 ? _d : (_e = element.center) === null || _e === void 0 ? void 0 : _e.lon) !== null && _f !== void 0 ? _f : 0;
                    const tags = element.tags || {};
                    const amenityValue = tags["amenity"] || tags["healthcare:facility:type"] || "";
                    const amenities = amenityMapping[amenityValue] || [];
                    return {
                        id: element.id,
                        name: tags["name"] || tags["name:en"] || `${amenityValue.charAt(0).toUpperCase() + amenityValue.slice(1)}`,
                        type: amenityValue,
                        latitude: lat,
                        longitude: lon,
                        address: [
                            tags["addr:street"],
                            tags["addr:housenumber"],
                            tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
                            tags["addr:postcode"],
                        ].filter(Boolean).join(", "),
                        phone: tags["phone"] || tags["contact:phone"],
                        website: tags["website"] || tags["contact:website"],
                        openingHours: tags["opening_hours"] || tags["opening_hours:en"],
                        amenities: amenities.length > 0 ? amenities : undefined,
                    };
                });
            }
            catch (error) {
                console.error("Overpass findNearbyFacilities API error:", error);
                if (axios_1.default.isAxiosError(error)) {
                    console.error("Response status:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.status);
                    console.error("Response body:", (_c = error.response) === null || _c === void 0 ? void 0 : _c.data);
                }
                return [];
            }
        });
    },
    findHospitals(latitude, longitude, radius) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield new Promise((resolve) => setTimeout(resolve, api_config_1.ApiConfig.rateLimitDelay));
            const query = `[out:json][timeout:25];node["amenity"="hospital"](around:${radius},${latitude},${longitude});way["amenity"="hospital"](around:${radius},${latitude},${longitude});node["healthcare"](around:${radius},${latitude},${longitude});way["healthcare"](around:${radius},${latitude},${longitude});out center;`;
            console.log("Overpass query:", query);
            console.log("Overpass headers:", JSON.stringify(getOverpassHeaders()));
            try {
                const params = new URLSearchParams();
                params.append("data", query);
                const response = yield axios_1.default.post(api_config_1.ApiConfig.overpassEndpoint, params, { headers: getOverpassHeaders() });
                console.log("Overpass response status:", response.status);
                console.log("Elements count:", ((_a = response.data.elements) === null || _a === void 0 ? void 0 : _a.length) || 0);
                return (response.data.elements || []).map((element) => {
                    var _a, _b, _c, _d, _e, _f;
                    const lat = (_c = (_a = element.lat) !== null && _a !== void 0 ? _a : (_b = element.center) === null || _b === void 0 ? void 0 : _b.lat) !== null && _c !== void 0 ? _c : 0;
                    const lon = (_f = (_d = element.lon) !== null && _d !== void 0 ? _d : (_e = element.center) === null || _e === void 0 ? void 0 : _e.lon) !== null && _f !== void 0 ? _f : 0;
                    const tags = element.tags || {};
                    return {
                        id: element.id,
                        name: tags["name"] || "Hospital",
                        type: "hospital",
                        latitude: lat,
                        longitude: lon,
                        address: [
                            tags["addr:street"],
                            tags["addr:housenumber"],
                            tags["addr:city"],
                            tags["addr:postcode"],
                        ].filter(Boolean).join(", "),
                        phone: tags["phone"] || tags["contact:phone"],
                        website: tags["website"],
                        openingHours: tags["opening_hours"],
                        amenities: this.extractHospitalAmenities(tags),
                    };
                });
            }
            catch (error) {
                console.error("Overpass findHospitals API error:", error);
                if (axios_1.default.isAxiosError(error)) {
                    console.error("Response status:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.status);
                    console.error("Response body:", (_c = error.response) === null || _c === void 0 ? void 0 : _c.data);
                }
                return [];
            }
        });
    },
    extractHospitalAmenities(tags) {
        const amenities = [];
        if (tags["emergency"] === "yes")
            amenities.push("Emergency Room");
        if (tags["healthcare:speciality"]) {
            amenities.push(...tags["healthcare:speciality"].split(";").map((s) => s.trim()));
        }
        if (tags["beds"])
            amenities.push(`${tags["beds"]} beds`);
        if (tags["healthcare:facility:type"]) {
            amenities.push(tags["healthcare:facility:type"]);
        }
        return amenities;
    },
};
