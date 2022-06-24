require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const { setTimeout } = require("timers/promises");

const { Schema, model } = mongoose;

//Create Schema
const collectionSchema = mongoose.Schema({
  token_id: Schema.Types.String,
  placed_orders: Schema.Types.Mixed,
  prices: Schema.Types.Mixed,
  last_sale: Schema.Types.Mixed,
  owner: Schema.Types.Mixed,
});

const router = express.Router();

router.get("/getData", async (req, res) => {
  const options = {
    method: "GET",
    headers: { Accept: "application/json", "X-API-KEY": process.env.X_API_KEY },
  };
  await getData(options, "dclassets", process.env.DECENTRALAND);
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function retrieveAssets(options, tokens, coll, contractAddress) {
  for (let index = 0; index < 5; index++) {
    try {
      const url = `https://api.opensea.io/api/v1/assets?${tokens}order_direction=desc&asset_contract_address=${contractAddress}&limit=20&include_orders=false`;
      console.log("url > ", url);
      const response = await axios.get(url, options);
      const assets = response.data["assets"].map(async (item) => {
        coll.findOneAndUpdate(
          { token_id: item.token_id },
          {
            last_sale: item["last_sale"],
            owner: item["owner"],
          },
          (err, doc) => {
            if (err) throw err;
            //console.log("asset: ", doc);
          }
        );
        return {
          last_sale: item["last_sale"],
          owner: item["owner"],
        };
      });
    } catch (error) {
      console.log(
        "> An error has ocurred, a new attemp to connect with Open Sea",
        error
      );
    }
    sleep(5000);
  }
}

async function retrieveOrders(options, tokens, coll, contractAddress, side) {
  for (let index = 0; index < 5; index++) {
    try {
      const url = `https://api.opensea.io/wyvern/v1/orders?asset_contract_address=${contractAddress}&bundled=false&include_bundled=false&${tokens}side=${side}&limit=20&offset=0&order_by=created_date&order_direction=desc`;
      const response = await axios.get(url, options);
      console.log("url orders >", url);
      const orders = response.data["orders"].map((order) => {
        return {
          orders: item.orders,
        };
      });
      for (let order of orders) {
        if (order.asset.token_id) {
          coll.findOneAndUpdate(
            { token_id: order.asset.token_id },
            {
              placed_orders: order,
            },
            (err, doc) => {
              if (err) throw err;
              //console.log("asset: ", doc);
            }
          );
        } else {
          coll.findOneAndUpdate(
            { token_id: order.asset.token_id },
            {
              placed_orders: [],
            },
            (err, doc) => {
              if (err) throw err;
              //console.log("asset: ", doc);
            }
          );
        }
      }
    } catch (error) {
      console.log(
        "> An error has ocurred, a new attemp to connect with Open Sea",
        error
      );
    }
    sleep(3000);
  }
}

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let index = 0; index < arr.length; index += chunkSize) {
    const chunk = arr.slice(index, index + chunkSize);
    res.push(chunk);
  }
  return res;
}

async function getData(
  options,
  collectionName,
  contractAddress
) {
  const coll = mongoose.model(collectionName, collectionSchema);
  const docs = await coll.find({});
  const chunks = sliceIntoChunks(docs, 19);

  //console.log(chunks);
  for (let index = 0; index <= chunks.length; index++) {
    const current_chunk = chunks[index];
    let tokens = "";
    //console.log("current_chunk >>> ", current_chunk);
    for (let j = 0; j < current_chunk.length; j++) {
      //console.log("position j chunk", current_chunk[j]);
      const token_id = current_chunk[j].token_id;
      tokens += "token_ids=" + token_id + "&";
    }

    console.log(tokens);

    Promise.allSettled([
      await retrieveAssets(options, tokens, coll, contractAddress),
      await retrieveOrders(options, tokens, coll, contractAddress, 0),
      await retrieveOrders(options, tokens, coll, contractAddress, 1),
    ]).then(
      setTimeout(async () => {
        await getData(options, collectionName, contractAddress);
        console.log("Completed!");
      }, 5000)
    );
  }
}

module.exports = router;
