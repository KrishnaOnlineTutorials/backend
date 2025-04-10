const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const PORT = process.env.PORT || 5000;
const { constructMongoURI } = require('./helpers/dbHelpers'); // Import the helper function

const app = express();

app.use(bodyParser.json());
app.use(cors());

const uri = constructMongoURI(); // Use the helper function to construct the URI

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB using Mongoose'))
    .catch(err => console.error('Error connecting to MongoDB:', err.message));

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});