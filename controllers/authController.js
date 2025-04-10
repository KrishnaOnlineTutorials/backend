require('dotenv').config();
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { Auth, User } = require('../models/User');
const secretKey = process.env.SECRET_KEY;

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const decryptedPassword = CryptoJS.AES.decrypt(password, 'secret-key').toString(CryptoJS.enc.Utf8);

        const authData = await Auth.findOne({ email, password: decryptedPassword });
        const userData = await User.findOne({ email });

        if (!authData) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const role = email === 'admin@gmail.com' ? 'admin' : 'user';
        console.log(secretKey)
        const token = jwt.sign({ email: authData.email, role }, secretKey, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Authentication successful',
            user: { email: userData.email, role, id: userData._id },
            token,
        });
    } catch (err) {
        console.error('Error during authentication:', err.message);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        }

        req.user = {
            email: decodedToken.email,
            role: decodedToken.role,
        };

        next();
    });
};

module.exports = {
    authenticateUser,
    authenticateToken,
};