const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create sub schema
const placedOrdersSchema = new Schema(
  {
    listings: {
      price: Schema.Types.Mixed,
      order_hash: Schema.Types.Mixed,
      listing_time: Schema.Types.Mixed,
      expiration_time: Schema.Types.Mixed,
      created_date: Schema.Types.Mixed,
      closing_date: Schema.Types.Mixed,
      sell_orders: Schema.Types.Mixed,
      maker: Schema.Types.Mixed,
      taker: Schema.Types.Mixed,
      side: Schema.Types.Mixed,
      symbol: Schema.Types.Mixed,
      eth_price: Schema.Types.Mixed,
    },
    offers: {
      price: Schema.Types.Mixed,
      order_hash: Schema.Types.Mixed,
      listing_time: Schema.Types.Mixed,
      expiration_time: Schema.Types.Mixed,
      created_date: Schema.Types.Mixed,
      closing_date: Schema.Types.Mixed,
      sell_orders: Schema.Types.Mixed,
      maker: Schema.Types.Mixed,
      taker: Schema.Types.Mixed,
      side: Schema.Types.Mixed,
      symbol: Schema.Types.String,
      eth_price: Schema.Types.Mixed,
    }
  },
  { _id: false }
);

const lastSaleSchema = new Schema({
  timestamp: Schema.Types.Mixed,
  price: Schema.Types.Mixed,
  eth_price: Schema.Types.Mixed,
  usd_price: Schema.Types.Mixed,
  symbol: Schema.Types.String
}, { _id: false });

const currentPriceSchema = new Schema({
  price: Schema.Types.Mixed,
  eth_price: Schema.Types.Mixed,
  symbol: Schema.Types.String,
}, { _id: false });

const bestOfferedPriceSchema = new Schema({
  price: Schema.Types.Mixed,
  eth_price: Schema.Types.Mixed,
  symbol: Schema.Types.String,
}, { _id: false });

//Create Schema
const collectionSchema = new Schema({
  token_id: {
    type: Schema.Types.String,
    unique: true,
  },
  placed_orders: [placedOrdersSchema],
  traits: Schema.Types.Mixed,
  last_sale: lastSaleSchema,
  owner: Schema.Types.Mixed,
  current_price: currentPriceSchema,
  best_offered_price: bestOfferedPriceSchema,
});

module.exports = collectionSchema;