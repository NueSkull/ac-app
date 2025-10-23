const localPath = './stock_update.csv';
const csv = require('csvtojson');
const db = require("../db/connection");
const format = require("pg-format");
const jsonToArray = require('../utils/jsonToArray')

const injectStockTable = async (csvJson) => {
    await db.query(`DROP TABLE IF EXISTS stock;`);
    await db.query(`CREATE TABLE stock (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        alpha_order VARCHAR,
        size_value VARCHAR,
        stock_level VARCHAR);`);
    const csvArrayd = await jsonToArray(csvJson);
    const skudArray = csvArrayd.map((row) => {
        return [row[0], row[0].substring(0,9), row[1], row[2], row[3]]
    })
    await db.query(format(`INSERT INTO stock (sku, primary_sku, alpha_order, size_value, stock_level) VALUES %L ON CONFLICT (sku) DO NOTHING;`, skudArray));

    
}

const storeStock = async () => {
const csvJson = await csv().fromFile(localPath)
await injectStockTable(csvJson);
}

module.exports = storeStock;