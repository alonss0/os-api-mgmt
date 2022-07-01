const express = require('express');
const Mongoose = require('mongoose');
const collSchema = require('../schemas/collSchema');
const Web3 = require('web3');

const router = express.Router();


/**
 * Create a collection in database with the collection address provided in params
 * Receive string of colletion address 
 * e.g http://example.com/collectionAddress
 * */
router.post('/addCollection', (req, res) => {
    try {
        const collectionName = Web3.utils.toChecksumAddress(req.body.collectionName);
        //Create Model
        const model = Mongoose.model(collectionName, collSchema);
        res.send();
    } catch (error) {

    }
})

/**
 * Create token_id or [token_id] in collection address provided
 * Receive string of colletion address and token_ids 
 * e.g http://example.com/collectionAddress?token_id=1&token_id=2...
 * MAX NUMBER OF TOKEN_ID STRING MUST BE 30 
 * MIN 1 TOKEN_ID
 * */
router.post('/addTokens/:collectionAddress?token_id', (req, res) => {
    const coll = Mongoose.model(collectionName, collSchema);
})

router.get('/getData', (req, res) => {
    //coll y arra tokens
})


module.exports = router;