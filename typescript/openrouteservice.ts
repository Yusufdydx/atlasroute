import axios from "axios";
import { ApiConfig } from "./api-config";

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: string;
  summary: {
    distance: number;
    duration: number;
  };
  steps: RouteStep[];
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  streetName: string;
}

export interface DistanceResult {
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  distance: number;
  duration: number;
}

export interface GeocodingCoordinates {
  latitude: number;
  longitude: number;
}

export const OpenRouteServiceUtilities = {
  async calculateRoute(
    start: GeocodingCoordinates,
    end: GeocodingCoordinates,
    options?: {
      profile?: "driving-car" | "cycling-regular" | "foot-walking";
      format?: "geojson" | "encodedpolyline";
    }
  ): Promise<RouteResult | null> {
    if (!ApiConfig.openRouteServiceApiKey) {
      throw new Error("OpenRouteService API key is not configured");
    }

    const profile = options?.profile || "driving-car";

    try {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${profile}`,
        {
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
          format: options?.format || "geojson",
        },
        {
          headers: {
            Authorization: ApiConfig.openRouteServiceApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      const steps = (route.segments || []).flatMap((segment: any) =>
        (segment.steps || []).map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.instruction?.text || step.way_points?.join(" → ") || "",
          streetName: step.name || "Unknown",
        }))
      );

      return {
        distance: route.summary?.distance ?? route.distance,
        duration: route.summary?.duration ?? route.duration,
        geometry: route.geometry,
        summary: {
          distance: route.summary?.distance ?? route.distance,
          duration: route.summary?.duration ?? route.duration,
        },
        steps,
      };
    } catch (error) {
      console.error("OpenRouteService API error:", error);
      return null;
    }
  },

  async getDistance(
    start: GeocodingCoordinates,
    end: GeocodingCoordinates,
    profile?: "driving-car" | "cycling-regular" | "foot-walking"
  ): Promise<DistanceResult | null> {
    if (!ApiConfig.openRouteServiceApiKey) {
      throw new Error("OpenRouteService API key is not configured");
    }

    const routeProfile = profile || "driving-car";

    try {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${routeProfile}`,
        {
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
        },
        {
          headers: {
            Authorization: ApiConfig.openRouteServiceApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];

      return {
        from: start,
        to: end,
        distance: route.summary?.distance ?? route.distance,
        duration: route.summary?.duration ?? route.duration,
      };
    } catch (error) {
      console.error("OpenRouteService API error:", error);
      return null;
    }
  },

  async getMatrix(
    locations: GeocodingCoordinates[],
    profile?: "driving-car" | "cycling-regular" | "foot-walking"
  ): Promise<{ distances: number[][]; durations: number[][] } | null> {
    if (!ApiConfig.openRouteServiceApiKey) {
      throw new Error("OpenRouteService API key is not configured");
    }

    const routeProfile = profile || "driving-car";

    try {
      const coordinates = locations.map((loc) => [loc.longitude, loc.latitude]);

      const response = await axios.post(
        `https://api.openrouteservice.org/v2/matrix/${routeProfile}`,
        {
          locations: coordinates,
          metrics: ["distance", "duration"],
        },
        {
          headers: {
            Authorization: ApiConfig.openRouteServiceApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        distances: response.data.distances,
        durations: response.data.durations,
      };
    } catch (error) {
      console.error("OpenRouteService matrix API error:", error);
      return null;
    }
  },

  formatDuration(seconds: number): string {
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

  formatDistance(meters: number): string {
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
