/**
 * Rate limiter middleware
 * Protects against brute force attacks by limiting requests from a single IP
 */

// Simple in-memory store for rate limiting
const rateWindowMs = 60 * 1000; // 1 minute window
const maxRequests = 60; // Maximum requests per window
const ipRequests = new Map();

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
        if (now - data.windowStart > rateWindowMs) {
            ipRequests.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes

const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    // Initialize or reset window if needed
    if (!ipRequests.has(ip) || now - ipRequests.get(ip).windowStart > rateWindowMs) {
        ipRequests.set(ip, {
            windowStart: now,
            count: 1
        });
        return next();
    }

    // Increment request count
    const requestData = ipRequests.get(ip);
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.'
        });
    }

    next();
};

// Higher rate limiting for auth endpoints to prevent brute force attacks
const authRateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const authWindow = 15 * 60 * 1000; // 15 minute window for auth routes
    const authMaxRequests = 10; // 10 requests per 15 minutes

    // Initialize or reset window if needed
    if (!ipRequests.has(`auth:${ip}`) || now - ipRequests.get(`auth:${ip}`).windowStart > authWindow) {
        ipRequests.set(`auth:${ip}`, {
            windowStart: now,
            count: 1
        });
        return next();
    }

    // Increment request count
    const requestData = ipRequests.get(`auth:${ip}`);
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > authMaxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again later.'
        });
    }

    next();
};

module.exports = {
    rateLimiter,
    authRateLimiter
}; 