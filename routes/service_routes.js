const express = require('express');
const Mongoose = require('mongoose');
const collSchema = require('../schemas/collSchema');
const Web3 = require('web3');

const router = express.Router();

router.post('/addCollection', async (req, res) => {
    try {
        const collectionName = Web3.utils.toChecksumAddress(req.body.collectionName);
        const arr = await Mongoose.connection.db.listCollections().toArray();
        if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
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
        if (req.query.token_id == null || req.query.collectionName == null) {
            res.send("Provide at least one token_id and the collection name");
        } else if (req.query.token_id.length > 50) {
            res.send("token_id's must be less than 50");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collectionName);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
                const model = Mongoose.model(collectionName, collSchema);
                const response = await model.find({
                    token_id: req.query.token_id
                })
                if (response.length != 0) {
                    res.send({"The next tokens already exists!": response});
                } else {
                    if (containsDuplicates(req.query.token_id)) {
                        res.send('Check token id params, duplicate values');
                    } else {
                        const obj = []
                        req.query.token_id.forEach(x => {
                            obj.push({ token_id: x });
                        })
                        model.create(obj);
                        res.send(`Tokens added! ${req.query.token_id}`)
                    }
                }
            } else {
                res.send("Collection doesn't exists!");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

router.get('/getData', async (req, res) => {
    try {
        if (req.query.token_id == null || req.query.collectionName == null) {
            res.send("Provide at least one token_id and the collection name");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collectionName);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
                const model = Mongoose.model(collectionName, collSchema);
                const response = await model.find({
                    token_id: req.query.token_id
                })
                const result = JSON.stringify(response, getCircularReplacer());
                res.send(result);
            } else {
                res.send("Collection doesn't exists!");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

function containsDuplicates(array) {
    const result = array.some(element => {
        if (array.indexOf(element) !== array.lastIndexOf(element)) {
            return true;
        }
        return false;
    });
    return result;
}


module.exports = router;