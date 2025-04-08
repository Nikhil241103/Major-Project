const jwt = require('jsonwebtoken');
const { User, Admin } = require('../db');

/**
 * Authentication middleware for JWT validation
 * Verifies token from request headers and attaches user data to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded;
        req.userId = decoded.id;
        req.userRole = decoded.role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token. Authentication failed.'
        });
    }
};

/**
 * Authorization middleware for admin-only routes
 * Must be used after authenticate middleware
 */
const adminOnly = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. Admin privileges required.'
        });
    }
    next();
};

module.exports = {
    authenticate,
    adminOnly
}; 