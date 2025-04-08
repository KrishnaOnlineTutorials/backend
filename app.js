const express = require('express');
const bodyParser = require('body-parser');
const mongoDB =  require('./mongoDB');
const PORT = 5000;
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

//http://localhost:5000/users
// Create a new record
app.post('/users', mongoDB.createUser);

app.get('/users', mongoDB.getUsers);

app.get('/users/:id', mongoDB.getUserById);

app.put('/users/:id', mongoDB.editUser);

app.delete('/users/:id', mongoDB.deleteUser);

app.post('/auth', mongoDB.authenticateUser);

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});