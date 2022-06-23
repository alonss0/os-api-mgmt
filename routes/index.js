require("dotenv").config();
const express = require("express");
const axios = require("axios");
const axiosRetry = require("axios-retry");
const fs = require("fs");
const DCLAsset = require("../model/DCLAsset");
const SBAsset = require("../model/SBAsset");
const SOMAsset = require("../model/SOMAsset");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("server working");
});

axiosRetry(axios, {
  retries: 5,
  retryDelay: () => 30000,
});

router.get("/getData", async (req, res) => {
  const metaverse = req.query.metaverse;
  const options = {
    method: "GET",
    headers: { Accept: "application/json", "X-API-KEY": process.env.X_API_KEY },
  };
  switch (metaverse) {
    case "somnium":
      getSomniumData(options, 4979, 4999);
      break;
    case "sandbox":
      getSandboxData(options, 102361, 102391);
      break;
    case "decentraland":
      go(options, 1, 31);
      break;
    case "test":
      const assetDcl = new DCLAsset({
        token_id: "2",
        last_sale: {
          user: null,
        },
        owner: null,
      });
      console.log(assetDcl);
      await assetDcl.save();
      break;
    default:
      break;
  }
});

const getTokensString = (start, end, cb) => {
  fs.readFile("./listDecentraland.txt", (err, data) => {
    if (err) throw err;
    const arr = data.toString().split(",");
    console.log(arr.length);
    let str = "?";
    for (let index = start; index < end; index++) {
      let element = arr[index];
      element = element.slice(2, element.length - 1);
      str += "token_ids=" + element + "&";
    }
    console.log(str);
    cb(str);
  });
};

function go(options, start = 1, end = 31) {
  if (end > 92598) {
    return;
  }
  getTokensString(start, end, async (str) => {
    let tokens = str;
    const url_dcl = `https://api.opensea.io/api/v1/assets${tokens}order_direction=asc&asset_contract_address=${process.env.DECENTRALAND}`;
    const response_dcl = await axios.get(url_dcl, options);
    const da = response_dcl.data["assets"].map((item) => {
      return {
        token_id: item["token_id"],
        last_sale: item["last_sale"],
        owner: item["owner"],
      };
    });

    da.forEach(async (element) => {
      const assetDcl = new DCLAsset({
        token_id: element["token_id"],
        last_sale: element["last_sale"],
        owner: element["owner"],
      });
      await assetDcl
        .save()
        .then((result) => {})
        .catch((err) => {
          throw err;
        });
    });
    start = end;
    if(end == 92581){
        end += 17;
    } else {
        end += 30;
    }
    go(options, start, end);
  });
  console.log(start, end);
}

const getTknStrSandbox = (start, end, cb) => {
  fs.readFile("./listSandbox.txt", (err, data) => {
    if (err) throw err;
    const arr = data.toString().split(",");
    console.log(arr.length);
    let str = "?";
    for (let index = start; index < end; index++) {
      let element = arr[index];
      element = element.slice(2, element.length - 1);
      str += "token_ids=" + element + "&";
    }
    console.log(str);
    cb(str);
  });
};

function getSandboxData(options, start = 1, end = 31) {
  if (end > 110290) {
    return;
  }
  getTknStrSandbox(start, end, async (str) => {
    let tokens = str;
    const url_dcl = `https://api.opensea.io/api/v1/assets${tokens}order_direction=asc&asset_contract_address=${process.env.SANDBOX}`;
    const response_dcl = await axios.get(url_dcl, options);
    const da = response_dcl.data["assets"].map((item) => {
      return {
        token_id: item["token_id"],
        last_sale: item["last_sale"],
        owner: item["owner"],
      };
    });

    da.forEach(async (element) => {
      const assetSB = new SBAsset({
        token_id: element["token_id"],
        last_sale: element["last_sale"],
        owner: element["owner"],
      });
      await assetSB
        .save()
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          throw err;
        });
    });
    start = end;
    if(end == 110281){
        end += 9;
    } else {
        end += 30;
    }
    getSandboxData(options, start, end);
  });
  console.log(start, end);
}

const getTknStrSomnium = (start, end, cb) => {
  let str = "?";
  let arr = Array.from({length: 5000}, (_, i) => i + 1)
  for (let index = start; index <= end; index++) {
    const element = arr[index];
    str += "token_ids=" + element + "&";
  }
  console.log(str);
  cb(str);
};

function getSomniumData(options, start = 4979, end = 4999) {
  if (end > 5000) {
    return;
  }
  getTknStrSomnium(start, end, async (str) => {
    let tokens = str;
    const url_dcl = `https://api.opensea.io/api/v1/assets${tokens}order_direction=asc&asset_contract_address=${process.env.SOMNIUM}`;
    const response_dcl = await axios.get(url_dcl, options);
    const da = response_dcl.data["assets"].map((item) => {
      return {
        token_id: item["token_id"],
        last_sale: item["last_sale"],
        owner: item["owner"],
      };
    });

    da.forEach(async (element) => {
      const assetSOM = new SOMAsset({
        token_id: element["token_id"],
        last_sale: element["last_sale"],
        owner: element["owner"],
      });
      await assetSOM
        .save()
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          throw err;
        });
    });
    start = end;
    if(end == 4980){
        end += 20;
    } else {
        end += 29;
    }
    getSomniumData(options, start, end);
  });
  console.log(start, end);
}

module.exports = router;
