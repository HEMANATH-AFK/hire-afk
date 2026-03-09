const axios = require('axios');

async function createAdmin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'System Admin',
            email: 'admin@hireafk.com',
            password: 'adminpassword123',
            role: 'admin'
        });
        console.log('Admin Account Created Successfully');
        console.log('Email: admin@hireafk.com');
        console.log('Password: adminpassword123');
    } catch (err) {
        console.error('Failed to create admin:', err.response ? err.response.data : err.message);
    }
}

createAdmin();
