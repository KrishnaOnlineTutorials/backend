const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId; // Import ObjectId from mongodb
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const secretKey = "mern-app"

const uri = 'mongodb+srv://krishnaonlinetutorials:qwerty123456789@cluster0.jwtby.mongodb.net/mern_testing?retryWrites=true&w=majority'; // Replace with your connection string

const createUser = async (req, res) => {
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        // password: req.body.password,
    }
    const decryptedPassword = CryptoJS.AES.decrypt(req.body.password, 'secret-key').toString(CryptoJS.enc.Utf8);
    const authData = {
        email: req.body.email,
        password: decryptedPassword
    }
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('mern_testing'); // Replace with your database name
        const collection = database.collection('users'); // Replace with your collection name
        await collection.insertOne(newUser);

        const authCollection = database.collection('auth'); // Replace with your collection name
        await authCollection.insertOne(authData);
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    } finally { 
        await client.close();
    }
    res.json(newUser);
}

const getUsers = async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let users;
    try {
        await client.connect();
        const database = client.db('mern_testing');
        users = await database.collection('users').find().toArray();
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    } 
    finally {
        await client.close();
    }
    res.json(users);
}

// New editUser function
const editUser = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters
    const updatedData = req.body; // Get the updated data from the request body

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('mern_testing');
        const collection = database.collection('users');

        // Update the user by ID
        // Write some logic here to update the user in the database
        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    } finally {
        await client.close();
    }
};

// New deleteUser function
const deleteUser = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('mern_testing');
        const userCollection = database.collection('users');
        const authCollection = database.collection('auth');


        const userData = await userCollection.findOne({_id: new ObjectId(userId)}) 
        console.log(userData)
        const authData = await authCollection.findOne({email: userData.email})
        console.log(authData)
        // Delete the user by ID
        // Write some logic here to delete the user from the database
        const result = await userCollection.deleteOne({ _id: new ObjectId(userId)})
        console.log(result)
        const resultTwo = await authCollection.deleteOne({ _id: new ObjectId(authData._id)})
        console.log(resultTwo)

        if (result.deletedCount === 1) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
        if (resultTwo.deletedCount === 1) {
            res.json({ message: 'Auth user deleted successfully' });
        } else {
            res.status(404).json({ error: 'Auth User not found' });
        }
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    } finally {
        await client.close();
    }
};

// New /auth handler
const authenticateUser = async (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body
    const decryptedPassword = CryptoJS.AES.decrypt(password, 'secret-key').toString(CryptoJS.enc.Utf8);
    console.log(decryptedPassword)

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('mern_testing');
        const authCollection = database.collection('auth');
        const userCollection = database.collection('users');

        // Find the user in the auth collection
        const authData = await authCollection.findOne({ email: email, password: decryptedPassword });
        const userData = await userCollection.findOne({email: email}) 

        if (!authData) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Assign role based on email
        const role = email === 'admin@gmail.com' ? 'admin' : 'user';

        // Generate a JWT token with the role included
        const token = jwt.sign({ email: authData.email, role }, secretKey, { expiresIn: '1h' });

        // Respond with user details, role, and token
        res.json({
            message: 'Authentication successful',
            user: { email: userData.email, role, id: userData._id },
            token,
        });
    } catch (err) {
        console.error('Error during authentication:', err.message);
        res.status(500).json({ error: 'Failed to authenticate user' });
    } finally {
        await client.close();
    }
};

const authenticateToken = (req, res, next) => {
    console.group('Reading headers');
    console.log(req.headers);
    console.groupEnd();

    const authHeader = req.headers['authorization'];
    // Authorization: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' }); // Unauthorized
    }

    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid or expired token' }); // Forbidden
        }

        // Attach the decoded token (including role) to the request object
        req.user = {
            email: decodedToken.email,
            role: decodedToken.role,
        };

        console.log('Authenticated user:', req.user); // Debugging: Log the authenticated user
        next(); // Call the next middleware or route handler
    });
};

const getUserById = async (req, res) => {
    const userId = req.params.id; // Extract the user ID from the request parameters
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('mern_testing');
        const usersCollection = database.collection('users');

        // Find the user by ID
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // Return 404 if user is not found
        }

        res.json(user); // Return the user details
    } catch (err) {
        console.error('Error fetching user by ID:', err.message);
        res.status(500).json({ error: 'Failed to fetch user' }); // Return 500 for server errors
    } finally {
        await client.close();
    }
};

exports.createUser = createUser;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.authenticateUser = authenticateUser;
exports.authenticateToken = authenticateToken;
exports.getUserById = getUserById;
exports.editUser = editUser;