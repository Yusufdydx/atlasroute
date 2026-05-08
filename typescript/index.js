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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const tools = __importStar(require("./tools"));
const mcp_1 = require("@modelcontextprotocol/sdk/server/mcp");
const streamableHttp_1 = require("@modelcontextprotocol/sdk/server/streamableHttp");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const web_1 = require("./web");
const auth_1 = require("./auth");
const location_token_1 = require("./location-token");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
                const value = valueParts.join("=").trim();
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = value;
                }
            }
        }
    });
}
const env = (_a = process.env["PO_ENV"]) === null || _a === void 0 ? void 0 : _a.toString();
let allowedHosts = undefined;
const allowAllHosts = process.env["ALLOW_ALL_HOSTS"] === "true";
if (allowAllHosts) {
    allowedHosts = undefined;
}
else {
    allowedHosts = [];
    switch (env) {
        case "dev":
            allowedHosts.push("ts.fhir-mcp.dev.promptopinion.ai");
            break;
        case "prod":
            allowedHosts.push("ts.fhir-mcp.promptopinion.ai");
            break;
        default:
            allowedHosts.push("localhost");
    }
}
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});
const mcpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { jsonrpc: "2.0", error: { code: -32603, message: "Rate limit exceeded" }, id: null }
});
if (allowedHosts && allowedHosts.length > 0) {
    app.use((req, res, next) => {
        const host = req.headers.host;
        if (!host || !allowedHosts.includes(host.replace(/:\d+$/, ""))) {
            res.status(403).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: `Invalid Host: ${host}` },
                id: null,
            });
            return;
        }
        next();
    });
}
const port = process.env["PORT"] || 5000;
const server = new mcp_1.McpServer({
    name: "PO-MCP-Server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        extensions: {
            "ai.promptopinion/fhir-context": {
                scopes: [
                    { name: "patient/Patient.rs", required: true },
                    { name: "patient/Condition.rs", required: false },
                    { name: "patient/MedicationRequest.rs", required: false },
                    { name: "patient/AllergyIntolerance.rs", required: false },
                ],
            },
        },
    },
});
for (const tool of Object.values(tools)) {
    try {
        tool.registerTool(server, {});
        console.log(`Registered tool: ${(_b = tool.constructor) === null || _b === void 0 ? void 0 : _b.name}`);
    }
    catch (err) {
        console.error(`Error registering tool ${(_c = tool.constructor) === null || _c === void 0 ? void 0 : _c.name}:`, err);
    }
}
// Serve React static files from web/dist
const webDistPath = path.join(__dirname, 'web', 'dist');
if (fs.existsSync(webDistPath)) {
    app.use(express_1.default.static(webDistPath));
    app.use(express_1.default.static(path.join(webDistPath, 'assets')));
    // Serve index.html at root for React app
    app.get('/', (req, res) => {
        res.sendFile(path.join(webDistPath, 'index.html'));
    });
    // GetLoc route - must come before catch-all
    app.get('/getloc/:token', (req, res) => {
        res.sendFile(path.join(webDistPath, 'index.html'));
    });
    // Catch-all for React router routes
    app.use((req, res, next) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/mcp')) {
            res.sendFile(path.join(webDistPath, 'index.html'));
        }
        else {
            next();
        }
    });
    console.log('Serving React static files from:', webDistPath);
}
// API routes (auth, keys, etc)
app.use('/api', (0, web_1.createWebRoutes)());
// Health endpoints
app.get("/health", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
}));
app.get("/healthz", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: "ok" });
}));
app.get("/readyz", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: "ready", services: { mcp: "ok", tools: Object.keys(tools).length + " registered" } });
}));
app.get("/metrics", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        requests: { total: 0 },
        tools: Object.keys(tools).length,
        timestamp: new Date().toISOString()
    });
}));
// Location API endpoints
app.get("/api/debug/tokens", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ tokens: location_token_1.LocationTokenService.debugGetAllTokens() });
}));
app.post("/api/location/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, latitude, longitude } = req.body;
    if (!token || latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, error: "Token, latitude, and longitude are required" });
        return;
    }
    const success = location_token_1.LocationTokenService.confirmLocation(token, latitude, longitude);
    if (success) {
        res.json({ success: true, message: "Location confirmed" });
    }
    else {
        res.status(400).json({ success: false, error: "Invalid or expired token" });
    }
}));
app.get("/api/location/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const status = location_token_1.LocationTokenService.getStatus(token);
    if (status === 'invalid') {
        res.json({ status: 'invalid', message: 'Token not found' });
        return;
    }
    if (status === 'expired') {
        res.json({ status: 'expired', message: 'Token has expired' });
        return;
    }
    if (status === 'pending') {
        res.json({ status: 'pending', message: 'Awaiting location confirmation' });
        return;
    }
    const coords = location_token_1.LocationTokenService.getCoordinates(token);
    if (coords) {
        res.json({ status: 'confirmed', latitude: coords.latitude, longitude: coords.longitude });
    }
    else {
        res.json({ status: 'invalid', message: 'Location data not found' });
    }
}));
app.get("/hello-world", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hello World");
}));
app.get("/mcp", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(405).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "MCP endpoints require POST requests" },
        id: null,
    });
}));
const apiKeyRequired = process.env["API_KEY_REQUIRED"] === 'true';
app.post("/mcp", mcpLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (apiKeyRequired) {
        const apiKeyHeader = req.headers['x-api-key'];
        if (!apiKeyHeader) {
            res.status(401).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: "API key required. Pass X-API-Key header." },
                id: null
            });
            return;
        }
        const apiKey = auth_1.AuthService.verifyApiKey(apiKeyHeader);
        if (!apiKey) {
            res.status(401).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: "Invalid or expired API key" },
                id: null
            });
            return;
        }
    }
    const acceptHeader = req.headers.accept;
    if (acceptHeader && !acceptHeader.includes("application/json") && !acceptHeader.includes("text/event-stream")) {
        res.status(406).json({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Not Acceptable: Client must accept both application/json and text/event-stream" },
            id: null,
        });
        return;
    }
    console.log("=== MCP Request ===");
    console.log("Method:", (_a = req.body) === null || _a === void 0 ? void 0 : _a.method);
    console.log("Params:", JSON.stringify((_b = req.body) === null || _b === void 0 ? void 0 : _b.params, null, 2));
    const transport = new streamableHttp_1.StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
    res.on("close", () => {
        transport.close();
    });
    try {
        yield server.connect(transport);
        yield transport.handleRequest(req, res, req.body);
    }
    catch (error) {
        console.error("=== MCP Error ===");
        console.error("Error:", error);
        if (!res.headersSent) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: `Internal server error: ${errorMessage}`,
                },
                id: null,
            });
        }
    }
}));
app.listen(port, () => {
    console.log(`MCP server listening on port ${port}`);
});
