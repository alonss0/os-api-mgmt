require('dotenv').config()
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get('/', (req, res) => {
    res.send("server working");
});

router.get('/getData', async (req, res) => {
    const metaverse = req.query.metaverse;
    const options = {
        method: 'GET',
        headers: {Accept: 'application/json', 'X-API-KEY': process.env.X_API_KEY}
      };
    switch (metaverse) {
        case "somnium":
            const url_somnium = `https://api.opensea.io/api/v1/asset/${process.env.SOMNIUM}/3138/listings?limit=20`;
            const response_somnium = await axios.get(url_somnium, options);
            res.send(response_somnium.data);
            break;
        case "sandbox":
            const url_sandbox = `https://api.opensea.io/api/v1/asset/${process.env.SANDBOX}/3138/listings?limit=20`;
            const response_sandbox = await axios.get(url_sandbox, options);
            res.send(response_sandbox.data);
            break;
        case "decentraland":
            const url_dcl = `https://api.opensea.io/api/v1/asset/${process.env.DECENTRALAND}/3138/listings?limit=20`;
            const response_dcl = await axios.get(url_dcl, options);
            res.send(response_dcl.data);
            break;
        default:
            break;
    }
})

module.exports = router;