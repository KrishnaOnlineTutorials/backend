const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the backend directory

// Helper function to read data from the file
const readData = () => {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    }
    return [];
};

// Helper function to write data to the file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Create a new record
app.post('/create', (req, res) => {
    const newData = req.body;
    newData.id = uuidv4(); // Add a unique id to the new data
    let data = readData();
    data.push(newData);
    console.log(data);
    writeData(data);
    res.status(201).send(newData);
});

// Read all records
app.get('/read', (req, res) => {
    const data = readData();
    res.status(200).send(data);
});

// Update a record by id
app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    let data = readData();
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updatedData }; // Merge existing data with updated data
        writeData(data);
        res.status(200).send(data[index]);
    } else {
        res.status(404).send({ message: 'Record not found' });
    }
});

// Delete a record by id
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    let data = readData();
    const newData = data.filter(item => item.id !== id);
    if (newData.length !== data.length) {
        writeData(newData);
        res.status(200).send({ message: 'Record deleted' });
    } else {
        res.status(404).send({ message: 'Record not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});