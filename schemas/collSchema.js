const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create sub schema
const placedOrdersSchema = new Schema(
  {
    current_price: Schema.Types.Mixed,
    order_hash: Schema.Types.Mixed,
    listing_time: Schema.Types.Mixed,
    expiration_time: Schema.Types.Mixed,
    created_date: Schema.Types.Mixed,
    closing_date: Schema.Types.Mixed,
    sell_orders: Schema.Types.Mixed,
  },
  { _id: false }
);

//Create Schema
const collectionSchema = new Schema({
  token_id: Schema.Types.String,
  placed_orders: [placedOrdersSchema],
  traits: Schema.Types.Mixed,
  last_sale: Schema.Types.Mixed,
  owner: Schema.Types.Mixed,
});

module.exports = collectionSchema;