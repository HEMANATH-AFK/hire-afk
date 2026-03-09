const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('[AUTH-DEBUG] No token provided');
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(`[AUTH-DEBUG] Token verified for user: ${decoded.id}, role: ${decoded.role} on ${req.method} ${req.originalUrl}`);
        next();
    } catch (err) {
        console.error(`[AUTH-DEBUG] Token verification failed: ${err.message}`);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(`[AUTH-DEBUG] Authorization failed. User role ${req.user.role} not in [${roles}]`);
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
        }
        next();
    };
};
