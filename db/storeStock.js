const localPath = './stock_update.csv';
const csv = require('csvtojson');
const db = require("../db/connection");
const format = require("pg-format");
const jsonToArray = require('../utils/jsonToArray')

const injectStockTable = async (csvJson) => {
    await db.query(`DROP TABLE IF EXISTS stock_import;`);
    await db.query(`CREATE TABLE stock_import (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        alpha_order VARCHAR,
        size_value VARCHAR,
        stock_level VARCHAR);`);
    const csvArrayd = await jsonToArray(csvJson);
    const skudArray = csvArrayd.map((row) => {
        return [row[0], row[0].substring(0,9), row[1], row[2], row[3]]
    })
    const startTime = Date.now();
    let elapsedTime = '';
    const interval = setInterval(function() {
        elapsedTime = Date.now() - startTime;
    }, 100);
    await db.query(format(`INSERT INTO stock_import (sku, primary_sku, alpha_order, size_value, stock_level) VALUES %L ON CONFLICT (sku) DO NOTHING;`, skudArray));
    clearInterval(interval)
    console.log(`Stock insertion finished after ${(elapsedTime / 1000).toFixed(3)} s`);
    await db.query(`DROP TABLE IF EXISTS stock;`);
    await db.query(`ALTER TABLE stock_import RENAME TO stock;`); 
    
}

const storeStock = async () => {
const csvJson = await csv().fromFile(localPath)
await injectStockTable(csvJson);
}

module.exports = storeStock;