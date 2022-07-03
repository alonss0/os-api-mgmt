const express = require('express');
const Mongoose = require('mongoose');
const collSchema = require('../schemas/collSchema');
const Web3 = require('web3');

const router = express.Router();

router.post('/addCollection', async (req, res) => {
    try {
        const collectionName = Web3.utils.toChecksumAddress(req.body.collectionName);
        const arr = await Mongoose.connection.db.listCollections().toArray();
        if(arr.some( coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)){
            res.send("Collection already exists!");
        } else {
            Mongoose.model(collectionName, collSchema);
            res.send("Collection added");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

router.post('/addTokens', async (req, res) => {
    try {
        if(req.query.token_id == null || req.query.collectionName == null){
            res.send("Provide at least one token_id and the collection name");
        } else if (req.query.token_id.length > 50) {
            res.send("token_id's must be less than 50");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collectionName);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if(arr.some( coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)){
                let str = "";
                const model = Mongoose.model(collectionName, collSchema);
                model.find({
                    token_id: req.query.token_id
                }, (err, doc) => {
                    str += `The next tokens already exists \n ${doc}`;
                })
                res.send(str);
            } else {
                res.send("Collection added");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

router.get('/getData', async (req, res) => {
    try {
        if(req.query.token_id == null || req.query.collectionName == null){
            res.send("Provide at least one token_id and the collection name");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collectionName);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if(arr.some( coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)){
                const model = Mongoose.model(collectionName, collSchema);
                for (const token_id of req.query.token_id) {
                    model.find({
                        token_id: token_id,
                    }, (err, doc) => {
                        if(doc){
                            console.log(`Token ${token_id} already exists as ${doc}`);
                        }
                    })
                }
            } else {
                res.send("Collection added");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})


module.exports = router;