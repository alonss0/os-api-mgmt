const express = require('express');
const Mongoose = require('mongoose');
const collSchema = require('../schemas/collSchema');
const Web3 = require('web3');
const fs = require('fs');
const multer = require('multer');
const csv = require('fast-csv');

const router = express.Router();

const upload = multer({ dest: 'tmp/csv/' });

function containsDuplicates(array) {
    const result = array.some(element => {
        if (array.indexOf(element) !== array.lastIndexOf(element)) {
            return true;
        }
        return false;
    });
    return result;
}

router.post('/upload-csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        } else if (req.query.collection == null) {
            return res.status(400).send('Provide collection name');
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collection);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
                const fileRows = [];
                csv.parseFile(req.file.path)
                    .on("data", (data) => {
                        fileRows.push({
                            token_id: data[0],
                        });
                    })
                    .on("end", () => {
                        fileRows.shift();
                        const model = Mongoose.model(collectionName, collSchema);
                        model.insertMany(fileRows)
                            .then(() => {
                                res.send(fileRows.length + ' token_ids have been succesfully uploaded to collection ' + collectionName);
                            })
                            .catch((error) => {
                                if (error) throw error;
                            })
                        fs.unlinkSync(req.file.path);
                    });

            } else {
                res.send("Collection doesn't exists!");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

router.post('/addCollection', async (req, res) => {
    try {
        const collectionName = Web3.utils.toChecksumAddress(req.query.collection);
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
        if (req.query.token_id == null || req.query.collection == null) {
            res.send("Provide at least one token_id and the collection name");
        } else if (req.query.token_id.length > 50) {
            res.send("token_id's must be less than 50");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collection);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
                const model = Mongoose.model(collectionName, collSchema);
                const response = await model.find({
                    token_id: req.query.token_id
                })
                if (response.length != 0) {
                    res.send({ "The next tokens already exists!": response });
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
        if (req.query.token_id == null || req.query.collection == null) {
            res.send("Provide at least one token_id and the collection name");
        } else {
            const collectionName = Web3.utils.toChecksumAddress(req.query.collection);
            const arr = await Mongoose.connection.db.listCollections().toArray();
            if (arr.some(coll => Web3.utils.toChecksumAddress(coll.name) === collectionName)) {
                const model = Mongoose.model(collectionName, collSchema);
                const response = await model.find({
                    token_id: req.query.token_id
                })
                res.send({ results: response });
            } else {
                res.send("Collection doesn't exists!");
            }
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

module.exports = router;