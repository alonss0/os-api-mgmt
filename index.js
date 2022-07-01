require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const getDataFromOpenSea = require("./functions/getDataFromOpenSea");
const service_routes = require("./routes/service_routes");

const options = {
    method: "GET",
    headers: { Accept: "application/json", "X-API-KEY": process.env.X_API_KEY },
}

mongoose.connect("mongodb://localhost:27017/os-api");

mongoose.connection.on("error", err => {
    console.log("err", err)
})

mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected", mongoose.connection.readyState);
    run();
})

const app = express();

app.use(express.json());
app.use(cors());

app.use("/service", service_routes);

const PORT = 3003 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
});

async function run() {
    while (mongoose.connection.readyState == 1) {
        const arr = await mongoose.connection.db.listCollections().toArray();
        for await (let collection of arr) {
            await getDataFromOpenSea.getDataFromOpenSea(options, collection.name, collection.name)
                .then(() => console.log("done!"))
                .catch((err) => console.log(err));
        }
    }
}
