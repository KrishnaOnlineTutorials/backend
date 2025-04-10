const { User, Auth } = require('../models/User');
const CryptoJS = require('crypto-js');

const createUser = async (req, res) => {
    try {
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

        await newUser.save();
        await authData.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Error saving user/auth:', err.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching user by ID:', err.message);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

const editUser = async (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;

    try {
        const result = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: result });
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

        res.status(200).json({ message: 'User and Auth record deleted successfully' });
    } catch (err) {
        console.error('Error deleting user/auth:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    editUser,
    deleteUser,
};