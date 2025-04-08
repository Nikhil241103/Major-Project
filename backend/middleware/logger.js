/**
 * Request logger middleware
 * Logs information about each request for monitoring and debugging
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, originalUrl, ip } = req;

    // Start timer
    const start = process.hrtime();

    // Log request info
    console.log(`📥 [${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

    // Override end method to log response info
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        // Calculate response time
        const elapsed = process.hrtime(start);
        const responseTimeMs = (elapsed[0] * 1000 + elapsed[1] / 1000000).toFixed(2);

        // Log response info
        const statusCode = res.statusCode;
        const statusColor = getStatusColor(statusCode);
        console.log(`📤 [${timestamp}] ${method} ${originalUrl} - ${statusColor}${statusCode}\x1b[0m - ${responseTimeMs}ms`);

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Get color code for HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} ANSI color code
 */
const getStatusColor = (status) => {
    if (status >= 500) return '\x1b[31m'; // Red for server errors
    if (status >= 400) return '\x1b[33m'; // Yellow for client errors
    if (status >= 300) return '\x1b[36m'; // Cyan for redirects
    if (status >= 200) return '\x1b[32m'; // Green for success
    return '\x1b[0m'; // Default color
};

module.exports = requestLogger; 