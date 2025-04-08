const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Admin } = require('../db');

// Helper function to generate JWT
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Unified login endpoint
router.post('/login', async (req, res) => {
    console.log("🔑 Login request received:", req.body);
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
        return res.status(400).json({ success: false, message: 'Identifier, password, and role are required' });
    }

    try {
        let user;

        // Check if identifier is an email (contains @ symbol)
        const isEmail = identifier.includes('@');

        if (role === 'admin') {
            // Find admin by username or email
            user = isEmail
                ? await Admin.findOne({ email: identifier })
                : await Admin.findOne({ username: identifier });
        } else {
            // Find candidate by username or email
            user = isEmail
                ? await User.findOne({ email: identifier })
                : await User.findOne({ username: identifier });
        }

        if (!user) {
            console.warn(`⚠️ Invalid ${role} credentials - user not found:`, identifier);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if we need to handle legacy non-hashed passwords
        if (user.password === password) {
            // Legacy password - update to hashed version
            console.log(`⚠️ Updating legacy password to hashed version for ${role}:`, user.username);
            user.password = await bcrypt.hash(password, 10);
            await user.save();

            // Generate JWT
            const token = generateToken(user._id, role);

            console.log(`✅ ${role} login successful for:`, user.username);
            return res.json({
                success: true,
                message: 'Login successful',
                role: role,
                token,
                username: user.username
            });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate JWT
            const token = generateToken(user._id, role);

            console.log(`✅ ${role} login successful for:`, user.username);
            res.json({
                success: true,
                message: 'Login successful',
                role: role,
                token,
                username: user.username
            });
        } else {
            console.warn(`⚠️ Invalid ${role} credentials - password mismatch for:`, user.username);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(`❌ Error in ${role} login:`, err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
});

// Register new user (candidate or admin)
router.post('/register', async (req, res) => {
    console.log("📝 Registration request received:", req.body);
    const { username, password, email, role } = req.body;

    // Validate input
    if (!username || !password) {
        console.warn("⚠️ Registration missing required fields");
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Basic password validation
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Check for password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
    }

    // Validate email format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
    }

    try {
        // Check if username already exists in either User or Admin collection
        const existingUser = await User.findOne({ username });
        const existingAdmin = await Admin.findOne({ username });

        if (existingUser || existingAdmin) {
            console.warn("⚠️ Registration failed - username already exists:", username);
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingUserEmail = await User.findOne({ email });
            const existingAdminEmail = await Admin.findOne({ email });

            if (existingUserEmail || existingAdminEmail) {
                console.warn("⚠️ Registration failed - email already exists");
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user or admin based on role
        if (role === 'admin') {
            // Create new admin
            const newAdmin = new Admin({
                username,
                password: hashedPassword,
                email: email || null // Email is optional
            });

            const savedAdmin = await newAdmin.save();
            console.log("✅ Admin registered successfully:", username);

            // Success
            res.status(201).json({
                success: true,
                message: 'Admin registration successful',
                user: {
                    id: savedAdmin._id,
                    username: savedAdmin.username,
                    email: savedAdmin.email,
                    role: 'admin'
                }
            });
        } else {
            // Create new candidate
            const newUser = new User({
                username,
                password: hashedPassword,
                email: email || null // Email is optional
            });

            const savedUser = await newUser.save();
            console.log("✅ User registered successfully:", username);

            // Success
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: {
                    id: savedUser._id,
                    username: savedUser.username,
                    email: savedUser.email,
                    role: 'candidate'
                }
            });
        }
    } catch (err) {
        console.error('❌ Error in registration:', err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
});

// Update forgot password endpoint to work with either username or email
router.post('/forgot-password', async (req, res) => {
    console.log("🔑 Password reset request received:", req.body);
    const { identifier } = req.body;

    if (!identifier) {
        console.warn("⚠️ Password reset missing identifier");
        return res.status(400).json({ success: false, message: 'Username or email is required' });
    }

    try {
        let user;

        // Check if identifier is an email (contains @ symbol)
        const isEmail = identifier.includes('@');

        if (isEmail) {
            // Try to find user by email first
            user = await User.findOne({ email: identifier });
            if (!user) {
                // Then try admin
                user = await Admin.findOne({ email: identifier });
            }
        } else {
            // Try to find user by username
            user = await User.findOne({ username: identifier });
            if (!user) {
                // Then try admin
                user = await Admin.findOne({ username: identifier });
            }
        }

        if (!user) {
            // Don't reveal if user exists for security reasons
            console.warn("⚠️ Password reset for non-existent user:", identifier);
            return res.status(200).json({
                success: true,
                message: 'If account exists, password reset instructions have been sent'
            });
        }

        // Generate a reset token (in a real app, you'd store this with an expiry)
        // Here we'll just use the user ID as a simple token for demo purposes
        const userId = user._id;
        console.log("✅ Password reset token generated for:", user.username);

        res.status(200).json({
            success: true,
            message: 'If account exists, password reset instructions have been sent',
            resetToken: userId // In a real app, don't expose this directly
        });
    } catch (err) {
        console.error('❌ Error in forgot password:', err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    console.log("🔑 Password reset confirmation received:", req.body);
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        console.warn("⚠️ Password reset missing token or new password");
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    try {
        // In a real app, you'd verify the token validity and expiry
        // Here we're just using the user ID as the token for demo purposes

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findByIdAndUpdate(
            token,
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            console.warn("⚠️ Password reset with invalid token:", token);
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        console.log("✅ Password reset successful for user ID:", token);
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (err) {
        console.error('❌ Error in reset password:', err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
});

// Check if username exists
router.post('/check-username', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    try {
        // Check if username exists in either User or Admin collection
        const existingUser = await User.findOne({ username });
        const existingAdmin = await Admin.findOne({ username });

        res.json({
            success: true,
            exists: !!(existingUser || existingAdmin)
        });
    } catch (err) {
        console.error('❌ Error checking username:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: err.message
        });
    }
});

// Check if email exists
router.post('/check-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Check if email exists in either User or Admin collection
        const existingUser = await User.findOne({ email });
        const existingAdmin = await Admin.findOne({ email });

        res.json({
            success: true,
            exists: !!(existingUser || existingAdmin)
        });
    } catch (err) {
        console.error('❌ Error checking email:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: err.message
        });
    }
});

module.exports = router; 