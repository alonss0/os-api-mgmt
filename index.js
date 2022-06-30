require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const getDataFromOpenSea = require("./routes/getDataFromOpenSea");

const router = require("./routes/getDataFromOpenSea");
const service_routes = require("./routes/service_routes");

const app = express();

app.use(express.json());
app.use(cors());

//app.use('/api', router);
app.use("/service", service_routes);

const PORT = 3003 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
    run();
});

async function run() {
    const connection = await mongoose
        .createConnection("mongodb://localhost:27017/os-api-mgmt")
        .asPromise();
    if (connection.readyState == 1) {
        const arr = await connection.db.listCollections().toArray();
        arr.forEach((element) => {
          console.log(element.name);
        });
    } else {
        console.log("Error connecting to database ...");
    }

    //await getDataFromOpenSea(options, "somassets", process.env.SOMNIUM);
}
