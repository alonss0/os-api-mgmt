require('dotenv').config()
const express = require("express");
const cors = require("cors");

const router = require('./routes/index');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', router);

const PORT = 3003 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
})