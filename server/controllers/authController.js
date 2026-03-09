const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = await User.create({ name, email, password, role });
        res.status(201).json({
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await require('bcryptjs').compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
