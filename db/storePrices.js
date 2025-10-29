const localPath = './price_list.csv';
const csv = require('csvtojson');
const db = require("../db/connection");
const format = require("pg-format");
const jsonToArray = require('../utils/jsonToArray')

const injectPricesTable = async (csvJson) => {
    await db.query(`DROP TABLE IF EXISTS prices_import;`);
    await db.query(`CREATE TABLE prices_import (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        price FLOAT(2)
        );`);
    const csvArrayd = await jsonToArray(csvJson);
    const skudArray = csvArrayd.map((row) => {
        return [row[0], row[0].substring(0,9), row[1]]
    })
    const startTime = Date.now();
    let elapsedTime = '';
    const interval = setInterval(function() {
        elapsedTime = Date.now() - startTime;
    }, 100);
    await db.query(format(`INSERT INTO prices_import (sku, primary_sku, price) VALUES %L ON CONFLICT (sku) DO NOTHING;`, skudArray));
    clearInterval(interval)
    console.log(`Price insertion finished after ${(elapsedTime / 1000).toFixed(3)} s`);
    await db.query(`DROP TABLE IF EXISTS prices;`);
    await db.query(`ALTER TABLE prices_import RENAME TO prices;`); 

}

const storePrices = async () => {
const csvJson = await csv().fromFile(localPath)
await injectPricesTable(csvJson);
}

module.exports = storePrices;