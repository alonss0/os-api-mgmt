const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const SOMAssetSchema = new Schema({
    token_id: Schema.Types.String,
    last_sale: Schema.Types.Mixed,
    owner: Schema.Types.Mixed,
})

const SOMAsset = model('SOMAsset', SOMAssetSchema);

module.exports = SOMAsset;