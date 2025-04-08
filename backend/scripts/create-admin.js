const bcrypt = require('bcrypt');
const { connectDB, Admin, closeDB } = require('../db');

async function createAdmin() {
    try {
        // Connect to the database
        await connectDB();
        console.log('Connected to database');

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            // Create a hashed password
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Create admin user
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com'
            });

            await admin.save();
            console.log('Admin user created successfully');
        }

        // Close connection
        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

// Run the function
createAdmin(); 