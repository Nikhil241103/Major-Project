const bcrypt = require('bcrypt');
const { connectDB, Admin, closeDB } = require('../db');

// Default admin credentials
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com'
};

async function resetAdmin() {
    try {
        // Connect to the database
        await connectDB();
        console.log('Connected to database');

        // Find admin
        const admin = await Admin.findOne({ username: DEFAULT_ADMIN.username });

        if (admin) {
            // Reset the password
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log('Admin password reset successfully');
        } else {
            // Create admin if not exists
            const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
            const newAdmin = new Admin({
                username: DEFAULT_ADMIN.username,
                password: hashedPassword,
                email: DEFAULT_ADMIN.email
            });
            await newAdmin.save();
            console.log('New admin user created successfully');
        }

        // Show the admin document
        const updatedAdmin = await Admin.findOne({ username: DEFAULT_ADMIN.username });
        console.log('Admin details:', {
            username: updatedAdmin.username,
            email: updatedAdmin.email,
            id: updatedAdmin._id
        });

        // Close connection
        await closeDB();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

// Run the function
resetAdmin(); 