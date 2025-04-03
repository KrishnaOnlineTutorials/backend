const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://krishnaonlinetutorials:qwerty123456789@cluster0.jwtby.mongodb.net/mern_testing?retryWrites=true&w=majority'; // Replace with your connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const database = client.db('mern_testing'); // Replace with your database name
        const collection = database.collection('users'); // Replace with your collection name
        // Perform operations on the collection
        // await collection.insertOne({ name: 'Krishna', occupation: 'Engineer', Hobbies: ['Coding', 'Reading', 'Teaching'] });
        // console.log(collection)
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    } finally {
        await client.close();
    }
}

connectDB();