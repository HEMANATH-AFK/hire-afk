const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const existing = await User.findOne({ email: 'admin@hireafk.com' });
        if (existing) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@hireafk.com',
            password: 'adminpassword123',
            role: 'admin'
        });

        console.log('ADMIN_CREATED_SUCCESSFULLY');
        process.exit(0);
    } catch (err) {
        console.error('Failed to create admin:', err);
        process.exit(1);
    }
}

createAdmin();
