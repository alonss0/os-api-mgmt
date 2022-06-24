require('dotenv').config()
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/os-api-mgmt');

const router = require('./routes/index');
const service_routes = require('./routes/service_routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', router);
app.use('/service', service_routes);

const PORT = 3003 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
})