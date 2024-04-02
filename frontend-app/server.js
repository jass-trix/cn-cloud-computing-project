require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;
const baseURL = process.env.BACKEND_URL

app.set('view engine', 'ejs');

// Serve static files (including the mock data file)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/v1/items`);
    // const response = await axios.get('http://localhost:3000/mock-data.json');

    const data = response.data;

    res.render('index', { data });
  } catch (error) {
    console.error('Error fetching data from the backend API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/s3-objects', async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/listS3Objects`);
        const data = response.data;
        res.render('s3objects', { data });
    } catch (error) {
        console.error('Error fetching data from the backend API:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/lambda-trigger', (req, res) => {
    res.render('lambda', { baseURL });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
