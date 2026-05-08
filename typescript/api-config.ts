export interface ApiConfig {
  openRouteServiceApiKey: string;
  nominatimEmail: string;
  nominatimUserAgent: string;
  overpassEndpoint: string;
  overpassAcceptHeader: string;
  overpassUserAgent: string;
  defaultSearchRadius: number;
  maxSearchRadius: number;
  rateLimitDelay: number;
}

const loadEnv = () => {
  try {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split("\n").forEach((line: string) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      });
    }
  } catch {
  }
};

loadEnv();

export const ApiConfig: ApiConfig = {
  openRouteServiceApiKey: process.env["OPENROUTESERVICE_API_KEY"] || "",
  nominatimEmail: process.env["NOMINATIM_EMAIL"] || "",
  nominatimUserAgent: process.env["NOMINATIM_USER_AGENT"] || "PO-MCP-Server/1.0",
  overpassEndpoint: process.env["OVERPASS_ENDPOINT"] || "https://overpass-api.de/api/interpreter",
  overpassAcceptHeader: process.env["OVERPASS_ACCEPT_HEADER"] || "application/json",
  overpassUserAgent: process.env["OVERPASS_USER_AGENT"] || "PO-MCP-Server/1.0",
  defaultSearchRadius: 5000,
  maxSearchRadius: 50000,
  rateLimitDelay: 200,
};

export const isConfigured = (): { configured: boolean; missingKeys: string[] } => {
  const missingKeys: string[] = [];
  
  if (!ApiConfig.openRouteServiceApiKey) {
    missingKeys.push("OPENROUTESERVICE_API_KEY");
  }
  if (!ApiConfig.nominatimEmail) {
    missingKeys.push("NOMINATIM_EMAIL");
  }
  
  return {
    configured: missingKeys.length === 0,
    missingKeys,
  };
};
