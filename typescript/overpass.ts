import axios from "axios";
import { ApiConfig } from "./api-config";

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface FacilityResult {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  amenities?: string[];
  distance?: number;
}

const amenityMapping: Record<string, string[]> = {
  hospital: ["emergency", "surgery", "icu", "maternity"],
  clinic: ["general", "primary_care", "vaccination"],
  pharmacy: ["medications", "prescriptions", "health_products"],
  doctor: ["general_practice", "specialist", "consultation"],
  dentist: ["dental_care", "emergency_dental"],
  optician: ["eye_care", "glasses", "contact_lenses"],
};

const getOverpassHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": ApiConfig.overpassUserAgent,
    "Accept-Encoding": "identity",
  };
  if (ApiConfig.overpassAcceptHeader) {
    headers["Accept"] = ApiConfig.overpassAcceptHeader;
  }
  return headers;
};

export const OverpassUtilities = {
  async findNearbyFacilities(
    latitude: number,
    longitude: number,
    radius: number,
    facilityTypes?: string[]
  ): Promise<FacilityResult[]> {
    await new Promise((resolve) => setTimeout(resolve, ApiConfig.rateLimitDelay));

    const typesToSearch = facilityTypes && facilityTypes.length > 0
      ? facilityTypes
      : ["hospital", "clinic", "pharmacy", "doctors", "dentist"];

    const amenityRegex = typesToSearch.join("|");
    let query = "";
    
    if (facilityTypes && facilityTypes.length === 1) {
      const ft = facilityTypes[0];
      query = `[out:json][timeout:25];node["amenity"="${ft}"](around:${radius},${latitude},${longitude});way["amenity"="${ft}"](around:${radius},${latitude},${longitude});out center;`;
    } else if (!facilityTypes || facilityTypes.length === 0) {
      query = `[out:json][timeout:25];node["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${latitude},${longitude});way["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${latitude},${longitude});node["healthcare"](around:${radius},${latitude},${longitude});way["healthcare"](around:${radius},${latitude},${longitude});out center;`;
    } else {
      query = `[out:json][timeout:25];node["amenity"~"${amenityRegex}"](around:${radius},${latitude},${longitude});way["amenity"~"${amenityRegex}"](around:${radius},${latitude},${longitude});out center;`;
    }

    console.log("Overpass query:", query);
    console.log("Overpass headers:", JSON.stringify(getOverpassHeaders()));
    
    try {
      const params = new URLSearchParams();
      params.append("data", query);
      
      const response = await axios.post<OverpassResponse>(
        ApiConfig.overpassEndpoint,
        params,
        { headers: getOverpassHeaders() }
      );

      console.log("Overpass response status:", response.status);
      console.log("Elements count:", response.data.elements?.length || 0);

      return (response.data.elements || []).map((element) => {
        const lat = element.lat ?? element.center?.lat ?? 0;
        const lon = element.lon ?? element.center?.lon ?? 0;
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
    } catch (error) {
      console.error("Overpass findNearbyFacilities API error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response body:", error.response?.data);
      }
      return [];
    }
  },

  async findHospitals(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<FacilityResult[]> {
    await new Promise((resolve) => setTimeout(resolve, ApiConfig.rateLimitDelay));

    const query = `[out:json][timeout:25];node["amenity"="hospital"](around:${radius},${latitude},${longitude});way["amenity"="hospital"](around:${radius},${latitude},${longitude});node["healthcare"](around:${radius},${latitude},${longitude});way["healthcare"](around:${radius},${latitude},${longitude});out center;`;

    console.log("Overpass query:", query);
    console.log("Overpass headers:", JSON.stringify(getOverpassHeaders()));
    
    try {
      const params = new URLSearchParams();
      params.append("data", query);
      
      const response = await axios.post<OverpassResponse>(
        ApiConfig.overpassEndpoint,
        params,
        { headers: getOverpassHeaders() }
      );

      console.log("Overpass response status:", response.status);
      console.log("Elements count:", response.data.elements?.length || 0);

      return (response.data.elements || []).map((element) => {
        const lat = element.lat ?? element.center?.lat ?? 0;
        const lon = element.lon ?? element.center?.lon ?? 0;
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
    } catch (error) {
      console.error("Overpass findHospitals API error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response body:", error.response?.data);
      }
      return [];
    }
  },

  extractHospitalAmenities(tags: Record<string, string>): string[] {
    const amenities: string[] = [];
    if (tags["emergency"] === "yes") amenities.push("Emergency Room");
    if (tags["healthcare:speciality"]) {
      amenities.push(...tags["healthcare:speciality"].split(";").map((s) => s.trim()));
    }
    if (tags["beds"]) amenities.push(`${tags["beds"]} beds`);
    if (tags["healthcare:facility:type"]) {
      amenities.push(tags["healthcare:facility:type"]);
    }
    return amenities;
  },
};