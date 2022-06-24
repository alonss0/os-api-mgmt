const express = require('express');
const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const router = express.Router();

//Create Schema
const collectionSchema = mongoose.Schema({
    token_id: Schema.Types.String,
    placed_orders: Schema.Types.Mixed,
    prices: Schema.Types.Mixed,
    last_sale: Schema.Types.Mixed,
    owner: Schema.Types.Mixed,
})

router.get('/', (req, res) => {

})

router.post('/addCollection', (req, res) => {
    const collectionName = req.body.collectionName;
    //Create Model
    mongoose.model(collectionName, collectionSchema);

    res.json("Done!")
})

router.post('/addTokenToCollection', (req, res) => {

})


module.exports = router;