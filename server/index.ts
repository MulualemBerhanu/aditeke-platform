import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage, PostgresStorage } from "./storage";
import { setCsrfToken, validateCsrfToken } from "./utils/csrf";
import 'dotenv/config';

const app = express();

// Enhanced CORS settings for cross-domain deployment
app.use((req, res, next) => {
  // Get the origin from the request headers, or use a default value
  const origin = req.headers.origin || '';
  
  // List of allowed origins including custom domain
  // Primary domain listed first without www prefix
  const allowedOrigins = [
    'https://aditeke.com',
    'http://aditeke.com',
    'https://www.aditeke.com',
    'http://www.aditeke.com',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://aditeke.replit.app',
    'https://aditeke.replit.dev'
  ];
  
  // Allow specified origins
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : (process.env.NODE_ENV === 'development' ? '*' : '');
  
  // Set necessary CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Enhanced JSON parser with debugging for API requests
app.use((req, res, next) => {
  // Add logging for Content-Type header to help debug parsing issues
  if (req.path.startsWith('/api/')) {
    console.log(`Incoming ${req.method} ${req.path} Content-Type:`, req.get('Content-Type'));
  }
  next();
});

// Configure JSON parser to be more permissive with content types
app.use(express.json({
  type: ['application/json', 'application/json; charset=utf-8', '+json', '*/json'],
  limit: '10mb',
  strict: false // Allow any JSON-like input
}));

// Add raw body parser for debugging
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/public/contact') {
    let rawData = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      rawData += chunk;
    });
    
    req.on('end', () => {
      console.log('Raw request body:', rawData);
      try {
        // Try to parse as JSON and attach to req.body
        const parsedData = JSON.parse(rawData);
        req.body = parsedData;
        console.log('Successfully parsed raw data into JSON:', parsedData);
      } catch (e) {
        console.error('Failed to parse raw data as JSON:', e);
      }
      next();
    });
  } else {
    next();
  }
});

// Add request body logging middleware to help debug login issues
app.use((req, res, next) => {
  // Only log for authentication endpoints
  if (req.path === '/api/login' || req.path === '/api/register') {
    console.log(`${req.method} ${req.path} - Request Body:`, {
      bodyExists: !!req.body,
      contentType: req.header('Content-Type'),
      bodyKeys: req.body ? Object.keys(req.body) : [],
    });
  }
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Parse cookies for CSRF validation

// Add CSRF protection
app.use(setCsrfToken); // Inject CSRF token into HTML responses
app.use(validateCsrfToken); // Protect against CSRF attacks

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Log the storage type
  log('Initializing storage backend...');
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
