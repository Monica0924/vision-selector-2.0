// Vercel Serverless Administrator Authentication Endpoint
// Verifies administrator credentials strictly on the server using environment variables.
// Uses constant-time string comparison to prevent timing attacks.
// Never exposes credentials, hashes, or secrets to the public client.

const crypto = require('node:crypto');

// In-memory rate limiting map for single-container execution (e.g., local dev or single lambda container)
// NOTE FOR DISTRIBUTED / MULTI-REGION PRODUCTION:
// In a multi-region serverless environment with cold starts, in-memory state is isolated per container.
// For enterprise-grade distributed rate limiting across all edge instances, configure Vercel Edge Middleware
// with an external Redis store (such as Upstash Redis: @upstash/ratelimit).
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5;
const attemptTracker = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const record = attemptTracker.get(ip);
  if (!record) return false;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    attemptTracker.delete(ip);
    return false;
  }
  return record.attempts >= MAX_ATTEMPTS_PER_WINDOW;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = attemptTracker.get(ip) || { attempts: 0, firstAttempt: now };
  record.attempts += 1;
  attemptTracker.set(ip, record);
}

function clearAttempts(ip) {
  attemptTracker.delete(ip);
}

// Constant-time string comparison to mitigate side-channel timing attacks
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const sendJson = (statusCode, data) => {
    if (typeof res.status === 'function') {
      const s = res.status(statusCode);
      if (s && typeof s.json === 'function') {
        return s.json(data);
      }
    }
    if (typeof res.json === 'function') {
      return res.json(data);
    }
    if (typeof res.writeHead === 'function') {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(405, { error: 'Method not allowed. Use POST.' });
  }

  // Determine client IP for rate limiting
  const headers = req.headers || {};
  const clientIp = (headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();

  if (isRateLimited(clientIp)) {
    return sendJson(429, {
      success: false,
      error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
    });
  }

  try {
    const { email, password } = req.body || {};
    const enteredPassword = typeof password === 'string' ? password.trim() : '';

    if (!enteredPassword) {
      return sendJson(400, { error: 'Administrator password is required.' });
    }

    // Credentials MUST be configured via server environment variables.
    // If ADMIN_PASSWORD is not set in Vercel environment, authentication is disabled.
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bgrneo.com';

    if (!adminPassword) {
      return sendJson(503, {
        success: false,
        error: 'ADMIN_PASSWORD environment variable is not configured on this server.'
      });
    }

    const isPasswordValid = timingSafeCompare(enteredPassword, adminPassword);
    const isEmailValid = !email || timingSafeCompare(email.trim().toLowerCase(), adminEmail.toLowerCase());

    if (isPasswordValid && isEmailValid) {
      clearAttempts(clientIp);

      // Generate a signed token using server-only secret
      const tokenSecret = process.env.AUTH_SECRET || adminPassword;
      const payload = {
        role: 'administrator',
        email: email || adminEmail,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 hour
      };
      const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signature = crypto.createHmac('sha256', tokenSecret).update(tokenData).digest('base64url');
      const token = `${tokenData}.${signature}`;

      return sendJson(200, {
        success: true,
        authenticated: true,
        token,
        user: {
          email: payload.email,
          role: payload.role
        },
        expiresIn: 3600
      });
    }

    recordFailedAttempt(clientIp);
    return sendJson(401, {
      success: false,
      authenticated: false,
      error: 'Invalid administrator credentials.'
    });
  } catch (error) {
    return sendJson(500, {
      error: 'Internal authentication server error.'
    });
  }
};
