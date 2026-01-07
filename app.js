const express = require("express");
const app = express();
const cors = require("cors");
const cron = require('node-cron')
const {getUserSettings, storeSettings, getUser} = require("./controllers/userSettings")
const {getStyleInfo} = require('./controllers/getStyleInfo')
const {getPricing, updatePricing} = require('./controllers/pricinglogic')
const {getFromPrice} = require('./controllers/getFromPrice')
const fetchStock = require('./db/fetchStock')
const fetchPrices = require('./db/fetchPrices')
const allowedOrigins = /^https?:\/\/(?:(?:.+\.)?apparel-catalogue\.co\.uk|shop\.ralawise\.com)$/;
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200 
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.get("/api/settings/:userid", getUserSettings);
app.patch("/api/set/:userid", storeSettings);
app.get("/api/styleinfo/:sku/:brand/:subdom/:lang", getStyleInfo);
app.get("/api/getuser/:ac", getUser);
app.get("/api/pricingrules/:ac", getPricing)
app.post("/api/pricingrules/:ac", updatePricing);
app.get("/api/getfromprice/:sku/:brand/:subdom/:lang", getFromPrice)

app.all('/*path', (err, req, res, next) => {
  res.status(404).send({msg: "Invalid prompt"})
})

cron.schedule('0 */5 * * * *', async () => {
  try {
    console.log("Fetching stock data...");
    await fetchStock;
  } catch (error) {
    console.error(error);
  }
});

cron.schedule('0 0 0 * * *', async () => {
  try {
    console.log("Fetching pricing data...");
    await fetchPrices;
  } catch (error) {
    console.error(error);
  }
});

async function initialCalls() {
await fetchStock;
await fetchPrices;
}

initialCalls();

module.exports = app;