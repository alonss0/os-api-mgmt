const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const SBAssetSchema = new Schema({
    token_id: Schema.Types.String,
    last_sale: Schema.Types.Mixed,
    owner: Schema.Types.Mixed,
})

const SBAsset = model('SBAsset', SBAssetSchema);

module.exports = SBAsset;