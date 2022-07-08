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

function getCurrentDate() {
  let date = new Date();
  return "" + ((10000 * date.getFullYear()) + (100 * (1 + date.getMonth())) + date.getDate());
}

function getTokenDivider(symbol) {
  if (symbol === 'USDC')
    return 1e6;
  if (symbol === 'CUBE')
    return 1e8;
  return 1e18;
}

async function getSymbolETHPrice(symbol, date) {
  if (symbol === 'USDC')
    return await getEthPrice('usd-coin', date);
  if (symbol === 'DAI')
    return await getEthPrice('dai', date);
  if (symbol === 'CUBE')
    return await getEthPrice('somnium-space-cubes', date);
  if (symbol === 'MANA')
    return await getEthPrice('decentraland', date);
  if (symbol === 'SAND')
    return await getEthPrice('the-sandbox', date);
  return 1;
}

async function getEthPrice(symbol, key) {
  let url = "https://api.coingecko.com/api/v3/coins/" + symbol + "/history?date="
    + key.substr(6) + "-" + key.substr(4, 2) + "-" + key.substr(0, 4);
  console.log("> url:", url);
  let response = await axios.get(url);
  response = await response.json();
  waitTime(500);
  return response.market_data.current_price.eth;
}

async function retrieveAssets(options, tokens, coll, contractAddress) {
  for (let index = 0; index < 2; index++) {
    try {
      const url = `https://api.opensea.io/api/v1/assets?${tokens}order_direction=desc&asset_contract_address=${contractAddress}&limit=20&include_orders=false`;
      console.log("url > ", url);
      const response = await axios.get(url, options);
      const assets = response.data["assets"].map(async (item) => {
        if (item.last_sale != null) {
          const date = new Date(item.last_sale.event_timestamp);
          const timestamp = date.getTime();
          const ls_price = parseInt(item.last_sale.total_price) / Math.pow(10, item.last_sale.payment_token.decimals);
          const eth_price = ls_price * item.last_sale.payment_token.eth_price;
          const last_sale = {
            timestamp: timestamp,
            price: ls_price,
            eth_price: eth_price,
            usd_price: parseInt(item.last_sale.payment_token.usd_price),
            symbol: item.last_sale.payment_token.symbol,
          };
          coll.findOneAndUpdate(
            { token_id: item.token_id },
            {
              last_sale: last_sale,
              owner: item["owner"],
              traits: item["traits"],
              placed_orders: [],
              current_price: {},
              best_offered_price: {},
            },
            (err, doc) => {
              if (err) throw err;
            }
          );
        }
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

async function retrieveOrders(options, tokens, coll, contractAddress) {
  for (let index = 0; index < 2; index++) {
    try {
      //const url = `https://api.opensea.io/wyvern/v1/orders?asset_contract_address=${contractAddress}&bundled=false&include_bundled=false&${tokens}side=${side}&limit=20&offset=0&order_by=created_date&order_direction=desc`;
      const url = `https://api.opensea.io/v2/orders/ethereum/seaport/offers?asset_contract_address=${contractAddress}&${tokens}`;
      const response = await axios.get(url, options);
      console.log("url offers >", url);
      const orders = response.data["orders"];
      for (let order of orders) {
        if (order.taker_asset_bundle.assets[0].token_id) {
          const current_price = parseInt(order.current_price) / getTokenDivider(symbol);
          const symbol = order.taker_asset_bundle.asset_contract.symbol;
          const current_date = getCurrentDate();
          const coin_eth_price = await getSymbolETHPrice(symbol, current_date);
          const eth_price = current_price * coin_eth_price;
          coll.findOneAndUpdate(
            { token_id: order.taker_asset_bundle.assets[0].token_id },
            {
              $addToSet: {
                placed_orders: [
                  {
                    offers: {
                      price: current_price,
                      order_hash: order.order_hash,
                      listing_time: order.listing_time,
                      expiration_time: order.expiration_time,
                      created_date: order.created_date,
                      closing_date: order.closing_date,
                      sell_orders: order.taker_asset_bundle.sell_orders,
                      order_type: order.order_type,
                      side: order.side,
                      maker: order.maker,
                      taker: order.taker,
                      symbol: symbol,
                      eth_price: eth_price,
                    }
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

async function retrieveListings(options, tokens, coll, contractAddress) {
  for (let index = 0; index < 2; index++) {
    try {
      const url = `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contractAddress}&${tokens}`;
      const response = await axios.get(url, options);
      console.log("url listings >", url);
      const orders = response.data["orders"];
      for (let order of orders) {
        if (order.taker_asset_bundle.assets[0].token_id) {
          const current_price = parseInt(order.current_price) / getTokenDivider(symbol);
          const symbol = order.taker_asset_bundle.asset_contract.symbol;
          const current_date = getCurrentDate();
          const coin_eth_price = await getSymbolETHPrice(symbol, current_date);
          const eth_price = current_price * coin_eth_price;
          coll.findOneAndUpdate(
            { token_id: order.taker_asset_bundle.assets[0].token_id },
            {
              $addToSet: {
                placed_orders: [
                  {
                    listings: {
                      price: current_price,
                      order_hash: order.order_hash,
                      listing_time: order.listing_time,
                      expiration_time: order.expiration_time,
                      created_date: order.created_date,
                      closing_date: order.closing_date,
                      sell_orders: order.taker_asset_bundle.sell_orders,
                      order_type: order.order_type,
                      side: order.side,
                      maker: order.maker,
                      taker: order.taker,
                      symbol: symbol,
                      eth_price: eth_price,
                    }
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
      await retrieveOrders(options, tokens, coll, contractAddress),
      await retrieveListings(options, tokens, coll, contractAddress),
    ]).then(async () => {
      console.log("waiting...");
    });
  }
}

module.exports = { getDataFromOpenSea };
