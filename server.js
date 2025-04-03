const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend MERN');
})

app.post('/getData', (req, res) => {
    const data = req.body;
    console.log(data)
    res.status(201).send(JSON.stringify(data))
})

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});