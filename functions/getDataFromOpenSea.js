const axios = require("axios");
const collSchema = require("../schemas/collSchema");
const mongoose = require("mongoose");

function waitTime(millis) {
  let start = Date.now(),
    currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - start < millis);
}

async function retrieveAssets(options, tokens, coll, contractAddress) {
  for (let index = 0; index < 2; index++) {
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
            traits: item["traits"],
            placed_orders: [],
          },
          (err, doc) => {
            if (err) throw err;
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
    waitTime(2000);
  }
}

async function retrieveOrders(options, tokens, coll, contractAddress, side) {
  for (let index = 0; index < 2; index++) {
    try {
      //const url = `https://api.opensea.io/wyvern/v1/orders?asset_contract_address=${contractAddress}&bundled=false&include_bundled=false&${tokens}side=${side}&limit=20&offset=0&order_by=created_date&order_direction=desc`;
      const url = `https://api.opensea.io/v2/orders/ethereum/seaport/offers?asset_contract_address=${contractAddress}&${tokens}`;
      const response = await axios.get(url, options);
      console.log("url orders >", url);
      const orders = response.data["orders"];
      for (let order of orders) {
        if (order.taker_asset_bundle.assets[0].token_id) {
          coll.findOneAndUpdate(
            { token_id: order.taker_asset_bundle.assets[0].token_id },
            {
              $addToSet: {
                placed_orders: [
                  {
                    current_price: order.current_price,
                    order_hash: order.order_hash,
                    listing_time: order.listing_time,
                    expiration_time: order.expiration_time,
                    created_date: order.created_date,
                    closing_date: order.closing_date,
                    sell_orders: order.taker_asset_bundle.sell_orders,
                  },
                ],
              },
            },
            (err, doc) => {
              if (err) throw err;
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
    waitTime(2000);
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

async function getDataFromOpenSea(options, collectionName, contractAddress) {
  const coll = mongoose.model(collectionName, collSchema);
  const docs = await coll.find({});
  const chunks = sliceIntoChunks(docs, 19);

  for (const current_chunk of chunks) {
    let tokens = "";
    for (let j = 0; j < current_chunk.length; j++) {
      const token_id = current_chunk[j].token_id;
      tokens += "token_ids=" + token_id + "&";
    }

    console.log("TOKENS STRING >> ", tokens);

    Promise.all([
      await retrieveAssets(options, tokens, coll, contractAddress),
      await retrieveOrders(options, tokens, coll, contractAddress, 0),
      //await retrieveOrders(options, tokens, coll, contractAddress, 1),
    ]).then(async () => {
      console.log("waiting...");
    });
  }
}

module.exports = { getDataFromOpenSea };
