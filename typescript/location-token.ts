import crypto from 'crypto';

export interface LocationToken {
  token: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'used' | 'expired';
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
  returnTo?: string;
}

const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const TOKEN_LENGTH = 11;
const TTL_MS = 30 * 60 * 1000; // 30 minutes

const tokenStore = new Map<string, LocationToken>();

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (data.status === 'pending' && now > data.expiresAt) {
      data.status = 'expired';
    }
  }
}, 30000);

function generateUniqueToken(): string {
  let token = '';
  let attempts = 0;
  const maxAttempts = 100;

  do {
    token = '';
    for (let i = 0; i < TOKEN_LENGTH; i++) {
      token += TOKEN_CHARS.charAt(Math.floor(Math.random() * TOKEN_CHARS.length));
    }
    attempts++;
  } while (tokenStore.has(token) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique token');
  }

  return token;
}

export const LocationTokenService = {
  debugGetAllTokens(): { token: string; status: string }[] {
    const tokens: { token: string; status: string }[] = [];
    for (const [t, data] of tokenStore.entries()) {
      tokens.push({ token: t, status: data.status });
    }
    return tokens;
  },

  createToken(returnTo?: string, expiresInMs?: number): LocationToken {
    const token = generateUniqueToken();
    const now = Date.now();
    const ttl = expiresInMs !== undefined ? expiresInMs : TTL_MS;
    
    const locationToken: LocationToken = {
      token,
      status: 'pending',
      createdAt: now,
      expiresAt: now + ttl,
      returnTo
    };
    
    tokenStore.set(token, locationToken);
    return locationToken;
  },

  getToken(token: string): LocationToken | null {
    const locationToken = tokenStore.get(token);
    if (!locationToken) {
      return null;
    }

    if (Date.now() > locationToken.expiresAt) {
      locationToken.status = 'expired';
    }

    return locationToken;
  },

  confirmLocation(token: string, latitude: number, longitude: number): boolean {
    const locationToken = tokenStore.get(token);
    if (!locationToken) {
      return false;
    }

    if (locationToken.status !== 'pending' && locationToken.status !== 'used') {
      return false;
    }

    if (Date.now() > locationToken.expiresAt) {
      locationToken.status = 'expired';
      return false;
    }

    locationToken.latitude = latitude;
    locationToken.longitude = longitude;
    locationToken.status = 'used';
    locationToken.usedAt = Date.now();

    return true;
  },

  getStatus(token: string): 'confirmed' | 'pending' | 'expired' | 'invalid' {
    const locationToken = tokenStore.get(token);
    if (!locationToken) {
      return 'invalid';
    }

    if (locationToken.status === 'pending' && Date.now() > locationToken.expiresAt) {
      locationToken.status = 'expired';
    }

    return locationToken.status;
  },

  getCoordinates(token: string): { latitude: number; longitude: number } | null {
    const locationToken = tokenStore.get(token);
    if (!locationToken || locationToken.status !== 'used') {
      return null;
    }

    if (!locationToken.latitude || !locationToken.longitude) {
      return null;
    }

    return {
      latitude: locationToken.latitude,
      longitude: locationToken.longitude
    };
  },

  deleteToken(token: string): void {
    tokenStore.delete(token);
  }
};