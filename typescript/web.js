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
exports.createWebRoutes = createWebRoutes;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
function createWebRoutes() {
    const router = express_1.default.Router();
    // =====================
    // API ROUTES
    // =====================
    router.post('/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { email, name, username, password, country } = req.body;
        if (!email || !name || !username || !password) {
            return res.json({ success: false, error: 'All fields are required' });
        }
        const result = yield auth_1.AuthService.registerUser(email, name, password, username, country);
        if (result.success && result.user) {
            const login = yield auth_1.AuthService.loginUser(email, password);
            if (login.success && login.session) {
                res.setHeader('Set-Cookie', [
                    'session=' + login.session + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (7 * 24 * 60 * 60)
                ]);
                res.json({
                    success: true,
                    user: {
                        id: result.user.id,
                        name: result.user.name,
                        email: result.user.email,
                        username: result.user.username,
                        country: result.user.country
                    },
                    redirect: '/dashboard'
                });
                return;
            }
        }
        res.json(Object.assign(Object.assign({}, result), { redirect: '/dashboard' }));
    }));
    router.post('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { email, username, password, redirect } = req.body;
        const loginField = email || username;
        if (!loginField || !password) {
            return res.json({ success: false, error: 'Email/Username and password required' });
        }
        const result = yield auth_1.AuthService.loginUser(loginField, password);
        if (result.success && result.session) {
            res.setHeader('Set-Cookie', [
                'session=' + result.session + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (7 * 24 * 60 * 60)
            ]);
            if (result.user) {
                res.json({
                    success: true,
                    user: {
                        id: result.user.id,
                        name: result.user.name,
                        email: result.user.email,
                        username: result.user.username,
                        country: result.user.country
                    },
                    redirect: redirect || '/dashboard'
                });
                return;
            }
        }
        res.json(Object.assign(Object.assign({}, result), { redirect: redirect || '/dashboard' }));
    }));
    router.post('/keys', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { name } = req.body;
        const userId = req.user.sub;
        if (!name) {
            return res.json({ success: false, error: 'Key name required' });
        }
        const apiKey = auth_1.AuthService.createApiKey(userId, name);
        res.json({ success: true, apiKey });
    }));
    router.put('/keys/:id', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.sub;
        const keyId = req.params.id;
        const { name } = req.body;
        const success = auth_1.AuthService.updateApiKeyName(keyId, userId, name);
        res.json({ success });
    }));
    router.delete('/keys/:id', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.sub;
        const keyId = req.params.id;
        const success = auth_1.AuthService.deleteApiKey(keyId, userId);
        res.json({ success });
    }));
    router.get('/keys', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.sub;
        const keys = auth_1.AuthService.getUserApiKeys(userId);
        res.json({ keys });
    }));
    router.post('/password', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.sub;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.json({ success: false, error: 'All fields required' });
        }
        const result = yield auth_1.AuthService.changePassword(userId, oldPassword, newPassword);
        res.json(result);
    }));
    router.get('/me', auth_1.authMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        const userId = req.user.sub;
        const user = auth_1.AuthService.getUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                country: user.country,
                createdAt: user.createdAt
            }
        });
    }));
    router.post('/logout', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.setHeader('Set-Cookie', [
            'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        ]);
        res.json({ success: true });
    }));
    return router;
}
