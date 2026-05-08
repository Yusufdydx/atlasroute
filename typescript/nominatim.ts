import axios from "axios";
import { ApiConfig } from "./api-config";

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    house_number?: string;
  };
  importance?: number;
  type?: string;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address?: {
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    houseNumber?: string;
  };
  type?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const NominatimUtilities = {
  async geocode(
    query: string,
    options?: { limit?: number; countrycodes?: string }
  ): Promise<GeocodingResult[]> {
    await sleep(ApiConfig.rateLimitDelay);

    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: String(options?.limit || 5),
    });

    if (options?.countrycodes) {
      params.append("countrycodes", options.countrycodes);
    }

    const response = await axios.get<NominatimResult[]>(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": ApiConfig.nominatimUserAgent,
          "Accept-Language": "en",
        },
      }
    );

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
  },

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    await sleep(ApiConfig.rateLimitDelay);

    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "json",
      addressdetails: "1",
    });

    try {
      const response = await axios.get<NominatimResult>(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            "User-Agent": ApiConfig.nominatimUserAgent,
            "Accept-Language": "en",
          },
        }
      );

      return {
        latitude: parseFloat(response.data.lat),
        longitude: parseFloat(response.data.lon),
        displayName: response.data.display_name,
        address: response.data.address
          ? {
              road: response.data.address.road,
              city:
                response.data.address.city ||
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
    } catch {
      return null;
    }
  },
};
