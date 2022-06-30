const express = require('express');
const mongoose = require('mongoose');
const collSchema = require('../model/collSchema');
const Web3 = require('web3');

const { Schema, model } = mongoose;
const router = express.Router();

router.get('/', (req, res) => {

})

router.post('/addCollection', (req, res) => {
    const collectionName = Web3.utils.toChecksumAddress(req.body.collectionName);
    //Create Model
    mongoose.model(collectionName, collSchema);

    res.json("Done!")
})

router.post('/addTokenToCollection', (req, res) => {
    const coll = mongoose.model(collectionName, collSchema);
})


module.exports = router;