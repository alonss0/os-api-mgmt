const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const DCLAssetSchema = new Schema({
    token_id: Schema.Types.String,
    last_sale: Schema.Types.Mixed,
    owner: Schema.Types.Mixed,
})

const DCLAsset = model('DCLAsset', DCLAssetSchema);

module.exports = DCLAsset;