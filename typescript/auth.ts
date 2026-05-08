import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const JWT_SECRET = (process.env.JWT_SECRET as string) || 'default-secret-change-me';

function signSession(userId: string): string {
  const timestamp = Date.now().toString();
  const data = userId + '.' + timestamp;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(data + '.' + signature).toString('base64url');
}

function verifySession(session: string): string | null {
  try {
    const decoded = Buffer.from(session, 'base64url').toString();
    const parts = decoded.split('.');
    if (parts.length !== 3) return null;
    const [userId, timestamp, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(userId + '.' + timestamp).digest('hex');
    if (signature !== expectedSig) return null;
    if (Date.now() - parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000) return null;
    return userId;
  } catch { return null; }
}

export { signSession, verifySession };
import * as fs from 'fs';
import * as path from 'path';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  country?: string;
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

const DB_PATH = (process.env.DB_PATH as string) || path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

const KEYS_FILE = path.join(DB_PATH, 'api-keys.json');
const USERS_FILE = path.join(DB_PATH, 'users.json');

function loadKeys(): ApiKey[] {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading API keys:', e);
  }
  return [];
}

function saveKeys(keys: ApiKey[]): void {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }
  return [];
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'po_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const AuthService = {
  async registerUser(email: string, name: string, password: string, username?: string, country?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = loadUsers();
    
    if (users.find(u => u.email === email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }
    
    if (username && users.find(u => u.username === username.toLowerCase())) {
      return { success: false, error: 'Username already taken' };
    }
    
    const passwordHash = await hashPassword(password);
    const user: User = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      username: username?.toLowerCase(),
      country,
      passwordHash,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    users.push(user);
    saveUsers(users);
    
    return { success: true, user: { ...user, passwordHash: '' } };
  },

  async loginUser(emailOrUsername: string, password: string): Promise<{ success: boolean; user?: User; session?: string; error?: string }> {
    const users = loadUsers();
    const input = emailOrUsername.toLowerCase();
    const user = users.find(u => u.email === input || u.username === input);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    if (!user.isActive) {
      return { success: false, error: 'Account is disabled' };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    const session = signSession(user.id);
    return { success: true, user: { ...user, passwordHash: '' }, session };
  },

  createApiKey(userId: string, name: string, daysUntilExpiry?: number): ApiKey {
    const keys = loadKeys();
    
    const apiKey: ApiKey = {
      id: `key_${Date.now()}`,
      key: generateApiKey(),
      name,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: daysUntilExpiry 
        ? new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      isActive: true
    };
    
    keys.push(apiKey);
    saveKeys(keys);
    
    return apiKey;
  },

  verifyApiKey(key: string): ApiKey | null {
    const keys = loadKeys();
    const apiKey = keys.find(k => k.key === key && k.isActive);
    
    if (!apiKey) {
      return null;
    }
    
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }
    
    return apiKey;
  },

  revokeApiKey(keyId: string, userId: string): boolean {
    const keys = loadKeys();
    const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
    
    if (keyIndex === -1) {
      return false;
    }
    
    keys[keyIndex].isActive = false;
    saveKeys(keys);
    
    return true;
  },

  getUserApiKeys(userId: string): ApiKey[] {
    const keys = loadKeys();
    return keys.filter(k => k.userId === userId);
  },

  updateApiKeyName(keyId: string, userId: string, name: string): boolean {
    const keys = loadKeys();
    const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
    
    if (keyIndex === -1) {
      return false;
    }
    
    keys[keyIndex].name = name;
    saveKeys(keys);
    
    return true;
  },

  deleteApiKey(keyId: string, userId: string): boolean {
    const keys = loadKeys();
    const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
    
    if (keyIndex === -1) {
      return false;
    }
    
    keys.splice(keyIndex, 1);
    saveKeys(keys);
    
    return true;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    const user = users[userIndex];
    
    // Verify old password
    const isValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Update with new password
    users[userIndex].passwordHash = await hashPassword(newPassword);
    saveUsers(users);
    
    return { success: true };
  },

  getUser(userId: string): User | null {
    const users = loadUsers();
    return users.find(u => u.id === userId) || null;
  }
};

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie as string;
  let session: string | null = null;
  
  // Extract session from cookie
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('session=')) {
        session = cookie.slice(8);
        break;
      }
    }
  }
  
  if (!session) {
    return res.status(401).json({ error: 'Session required' });
  }
  
  const userId = verifySession(session);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  const user = AuthService.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  (req as any).user = { sub: user.id, email: user.email, name: user.name };
  next();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = req.headers['x-api-key'] as string;
  
  if (!apiKeyHeader) {
    return res.status(401).json({ error: 'API key required. Pass in X-API-Key header.' });
  }
  
  const apiKey = AuthService.verifyApiKey(apiKeyHeader);
  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid or expired API key' });
  }
  
  (req as any).apiKey = apiKey;
  next();
}