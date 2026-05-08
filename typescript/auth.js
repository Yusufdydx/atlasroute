"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthService = void 0;
exports.signSession = signSession;
exports.verifySession = verifySession;
exports.generateApiKey = generateApiKey;
exports.authMiddleware = authMiddleware;
exports.requireApiKey = requireApiKey;
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
function signSession(userId) {
    const timestamp = Date.now().toString();
    const data = userId + '.' + timestamp;
    const signature = crypto_1.default.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    return Buffer.from(data + '.' + signature).toString('base64url');
}
function verifySession(session) {
    try {
        const decoded = Buffer.from(session, 'base64url').toString();
        const parts = decoded.split('.');
        if (parts.length !== 3)
            return null;
        const [userId, timestamp, signature] = parts;
        const expectedSig = crypto_1.default.createHmac('sha256', JWT_SECRET).update(userId + '.' + timestamp).digest('hex');
        if (signature !== expectedSig)
            return null;
        if (Date.now() - parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000)
            return null;
        return userId;
    }
    catch (_a) {
        return null;
    }
}
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data');
// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}
const KEYS_FILE = path.join(DB_PATH, 'api-keys.json');
const USERS_FILE = path.join(DB_PATH, 'users.json');
function loadKeys() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
        }
    }
    catch (e) {
        console.error('Error loading API keys:', e);
    }
    return [];
}
function saveKeys(keys) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        }
    }
    catch (e) {
        console.error('Error loading users:', e);
    }
    return [];
}
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = yield crypto_1.default.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
}
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordHash = yield hashPassword(password);
        return passwordHash === hash;
    });
}
function generateApiKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'po_';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.AuthService = {
    registerUser(email, name, password, username, country) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = loadUsers();
            if (users.find(u => u.email === email.toLowerCase())) {
                return { success: false, error: 'Email already registered' };
            }
            if (username && users.find(u => u.username === username.toLowerCase())) {
                return { success: false, error: 'Username already taken' };
            }
            const passwordHash = yield hashPassword(password);
            const user = {
                id: `user_${Date.now()}`,
                email: email.toLowerCase(),
                name,
                username: username === null || username === void 0 ? void 0 : username.toLowerCase(),
                country,
                passwordHash,
                createdAt: new Date().toISOString(),
                isActive: true
            };
            users.push(user);
            saveUsers(users);
            return { success: true, user: Object.assign(Object.assign({}, user), { passwordHash: '' }) };
        });
    },
    loginUser(emailOrUsername, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = loadUsers();
            const input = emailOrUsername.toLowerCase();
            const user = users.find(u => u.email === input || u.username === input);
            if (!user) {
                return { success: false, error: 'Invalid credentials' };
            }
            if (!user.isActive) {
                return { success: false, error: 'Account is disabled' };
            }
            const isValid = yield verifyPassword(password, user.passwordHash);
            if (!isValid) {
                return { success: false, error: 'Invalid credentials' };
            }
            const session = signSession(user.id);
            return { success: true, user: Object.assign(Object.assign({}, user), { passwordHash: '' }), session };
        });
    },
    createApiKey(userId, name, daysUntilExpiry) {
        const keys = loadKeys();
        const apiKey = {
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
    verifyApiKey(key) {
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
    revokeApiKey(keyId, userId) {
        const keys = loadKeys();
        const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
        if (keyIndex === -1) {
            return false;
        }
        keys[keyIndex].isActive = false;
        saveKeys(keys);
        return true;
    },
    getUserApiKeys(userId) {
        const keys = loadKeys();
        return keys.filter(k => k.userId === userId);
    },
    updateApiKeyName(keyId, userId, name) {
        const keys = loadKeys();
        const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
        if (keyIndex === -1) {
            return false;
        }
        keys[keyIndex].name = name;
        saveKeys(keys);
        return true;
    },
    deleteApiKey(keyId, userId) {
        const keys = loadKeys();
        const keyIndex = keys.findIndex(k => k.id === keyId && k.userId === userId);
        if (keyIndex === -1) {
            return false;
        }
        keys.splice(keyIndex, 1);
        saveKeys(keys);
        return true;
    },
    changePassword(userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = loadUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }
            const user = users[userIndex];
            // Verify old password
            const isValid = yield verifyPassword(oldPassword, user.passwordHash);
            if (!isValid) {
                return { success: false, error: 'Current password is incorrect' };
            }
            // Update with new password
            users[userIndex].passwordHash = yield hashPassword(newPassword);
            saveUsers(users);
            return { success: true };
        });
    },
    getUser(userId) {
        const users = loadUsers();
        return users.find(u => u.id === userId) || null;
    }
};
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookieHeader = req.headers.cookie;
        let session = null;
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
        const user = exports.AuthService.getUser(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = { sub: user.id, email: user.email, name: user.name };
        next();
    });
}
function requireApiKey(req, res, next) {
    const apiKeyHeader = req.headers['x-api-key'];
    if (!apiKeyHeader) {
        return res.status(401).json({ error: 'API key required. Pass in X-API-Key header.' });
    }
    const apiKey = exports.AuthService.verifyApiKey(apiKeyHeader);
    if (!apiKey) {
        return res.status(401).json({ error: 'Invalid or expired API key' });
    }
    req.apiKey = apiKey;
    next();
}
