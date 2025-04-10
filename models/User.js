const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
});

// Auth Schema
const authSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Models
const User = mongoose.model('User', userSchema);
const Auth = mongoose.model('Auth', authSchema, 'auth');

module.exports = { User, Auth };