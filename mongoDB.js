const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { User, Auth } = require('./models/User'); // Import Mongoose models
const secretKey = process.env.secretKey;

const createUser = async (req, res) => {
    const decryptedPassword = CryptoJS.AES.decrypt(req.body.password, 'secret-key').toString(CryptoJS.enc.Utf8);

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
    });

    const authData = new Auth({
        email: req.body.email,
        password: decryptedPassword,
    });

    try {
        await newUser.save();
        await authData.save();
        res.json(newUser);
    } catch (err) {
        console.error('Error saving user/auth:', err.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const editUser = async (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;

    try {
        const result = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        if (!result) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully', user: result });
        }
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const auth = await Auth.findOne({ email: user.email });
        if (!auth) {
            return res.status(404).json({ error: 'Auth record not found' });
        }

        await User.deleteOne({ _id: userId });
        await Auth.deleteOne({ email: user.email });

        res.json({ message: 'User and Auth record deleted successfully' });
    } catch (err) {
        console.error('Error deleting user/auth:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;
    const decryptedPassword = CryptoJS.AES.decrypt(password, 'secret-key').toString(CryptoJS.enc.Utf8);

    try {
        const authData = await Auth.findOne({ email, password: decryptedPassword });
        const userData = await User.findOne({ email });

        if (!authData) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const role = email === 'admin@gmail.com' ? 'admin' : 'user';
        const token = jwt.sign({ email: authData.email, role }, secretKey, { expiresIn: '1h' });

        res.json({
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

const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching user by ID:', err.message);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

exports.createUser = createUser;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.authenticateUser = authenticateUser;
exports.authenticateToken = authenticateToken;
exports.getUserById = getUserById;
exports.editUser = editUser;