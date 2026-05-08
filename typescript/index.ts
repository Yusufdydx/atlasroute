import * as tools from "./tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { IMcpTool } from "./IMcpTool";
import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as fs from "fs";
import * as path from "path";
import { createWebRoutes } from "./web";
import { AuthService } from "./auth";
import * as locationToken from "./location-token";

const LocationTokenService = locationToken.LocationTokenService;

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line: string) => {
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

const env = process.env["PO_ENV"]?.toString();
let allowedHosts: string[] | undefined = undefined;

const allowAllHosts = process.env["ALLOW_ALL_HOSTS"] === "true";

if (allowedHosts && allowedHosts.length > 0) {
  app.use((req, res, next) => {
    const rawHost = req.headers.host;
    const host = rawHost?.replace(/:\d+$/, "");

    if (!host) {
      return res.status(403).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Missing Host header" },
        id: null,
      });
    }

    const isLocal =
      host === "localhost" || host === "127.0.0.1";

    const isAllowedExact = allowedHosts.includes(host);

    const isRender = host.endsWith(".onrender.com");

    const isProdDomain =
      host === "ts.fhir-mcp.promptopinion.ai" ||
      host === "ts.fhir-mcp.dev.promptopinion.ai";

    if (!(isLocal || isAllowedExact || isRender || isProdDomain)) {
      return res.status(403).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Invalid Host: ${host}`,
        },
        id: null,
      });
    }

    next();
  });
}

const app = express();
app.set("trust proxy", 1);
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { jsonrpc: "2.0", error: { code: -32603, message: "Rate limit exceeded" }, id: null }
});

if (allowedHosts && allowedHosts.length > 0) {
  app.use((req, res, next) => {
    const host = req.headers.host;
    if (!host || !allowedHosts!.includes(host.replace(/:\d+$/, ""))) {
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

const server = new McpServer(
  {
    name: "PO-MCP-Server",
    version: "1.0.0",
  },
  {
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
  },
);

for (const tool of Object.values<IMcpTool>(tools)) {
  try {
    tool.registerTool(server, {} as any);
    console.log(`Registered tool: ${(tool as any).constructor?.name}`);
  } catch (err) {
    console.error(`Error registering tool ${(tool as any).constructor?.name}:`, err);
  }
}

// Serve React static files from web/dist
const webDistPath = path.join(__dirname, 'web', 'dist');
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.use(express.static(path.join(webDistPath, 'assets')));
  
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
    } else {
      next();
    }
  });
  console.log('Serving React static files from:', webDistPath);
}

// API routes (auth, keys, etc)
app.use('/api', createWebRoutes());

// Health endpoints
app.get("/health", async (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/healthz", async (_, res) => {
  res.json({ status: "ok" });
});

app.get("/readyz", async (_, res) => {
  res.json({ status: "ready", services: { mcp: "ok", tools: Object.keys(tools).length + " registered" } });
});

app.get("/metrics", async (_req, res) => {
  res.json({ 
    requests: { total: 0 },
    tools: Object.keys(tools).length,
    timestamp: new Date().toISOString()
  });
});

// Location API endpoints
app.get("/api/debug/tokens", async (req: Request, res: Response) => {
  res.json({ tokens: LocationTokenService.debugGetAllTokens() });
});

app.post("/api/location/confirm", async (req: Request, res: Response) => {
  const { token, latitude, longitude } = req.body;
  
  if (!token || latitude === undefined || longitude === undefined) {
    res.status(400).json({ success: false, error: "Token, latitude, and longitude are required" });
    return;
  }
  
  const success = LocationTokenService.confirmLocation(token, latitude, longitude);
  
  if (success) {
    res.json({ success: true, message: "Location confirmed" });
  } else {
    res.status(400).json({ success: false, error: "Invalid or expired token" });
  }
});

app.get("/api/location/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  
  const status = LocationTokenService.getStatus(token);
  
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
  
  const coords = LocationTokenService.getCoordinates(token);
  if (coords) {
    res.json({ status: 'confirmed', latitude: coords.latitude, longitude: coords.longitude });
  } else {
    res.json({ status: 'invalid', message: 'Location data not found' });
  }
});

app.get("/hello-world", async (_, res) => {
  res.send("Hello World");
});

app.get("/mcp", async (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "MCP endpoints require POST requests" },
    id: null,
  });
});

const apiKeyRequired = process.env["API_KEY_REQUIRED"] === 'true';

app.post("/mcp", mcpLimiter, async (req: Request, res: Response) => {
  if (apiKeyRequired) {
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (!apiKeyHeader) {
      res.status(401).json({ 
        jsonrpc: "2.0", 
        error: { code: -32000, message: "API key required. Pass X-API-Key header." }, 
        id: null 
      });
      return;
    }
    const apiKey = AuthService.verifyApiKey(apiKeyHeader);
    if (!apiKey) {
      res.status(401).json({ 
        jsonrpc: "2.0", 
        error: { code: -32000, message: "Invalid or expired API key" }, 
        id: null 
      });
      return;
    }
  }
  
  const acceptHeader = req.headers.accept as string;
  if (acceptHeader && !acceptHeader.includes("application/json") && !acceptHeader.includes("text/event-stream")) {
    res.status(406).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Not Acceptable: Client must accept both application/json and text/event-stream" },
      id: null,
    });
    return;
  }

  console.log("=== MCP Request ===");
  console.log("Method:", req.body?.method);
  console.log("Params:", JSON.stringify(req.body?.params, null, 2));

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
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
});

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});
