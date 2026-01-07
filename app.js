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
const fetchSizes = require('./db/fetchSizes')
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
app.get("/api/sync/stock", async (req, res) => {
  try {
    await fetchStock();
    res.send({msg: "Stock synced"});
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});
app.get("/api/sync/prices", async (req, res) => {
  try {
    await fetchPrices();
    res.send({msg: "Prices synced"});
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});
app.get("/api/sync/sizes", async (req, res) => {
  try {
    await fetchSizes();
    res.send({msg: "Sizes synced"});
  } catch (err) {
    res.status(500).send({error: err.message});
  }
});

app.all('/*path', (err, req, res, next) => {
  res.status(404).send({msg: "Invalid prompt"})
})

cron.schedule('0 */5 * * * *', async () => {
  try {
    console.log("Fetching stock data...");
    await fetchStock();
  } catch (error) {
    console.error(error);
  }
});

cron.schedule('0 0 1 * * *', async () => {
  try {
    console.log("Fetching pricing data...");
    await fetchPrices();
  } catch (error) {
    console.error(error);
  }
});

cron.schedule('0 0 2 * * *', async () => {
  try {
    console.log("Fetching sizes data...");
    await fetchSizes();
  } catch (error) {
    console.error(error);
  }
});

module.exports = app;