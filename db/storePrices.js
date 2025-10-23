const localPath = './price_list.csv';
const csv = require('csvtojson');
const db = require("../db/connection");
const format = require("pg-format");
const jsonToArray = require('../utils/jsonToArray')

const injectPricesTable = async (csvJson) => {
    await db.query(`DROP TABLE IF EXISTS prices;`);
    await db.query(`CREATE TABLE prices (
        uniqueID VARCHAR PRIMARY KEY,
        sku VARCHAR,
        primary_sku VARCHAR,
        price FLOAT(2),
        customer VARCHAR
        );`);
    const csvArrayd = await jsonToArray(csvJson);
    const skudArray = csvArrayd.map((row) => {
        return [(row[2]+row[0]), row[0], row[0].substring(0,9), row[1], row[2]]
    })
    await db.query(format(`INSERT INTO prices (uniqueID, sku, primary_sku, price, customer) VALUES %L ON CONFLICT (uniqueID) DO NOTHING;`, skudArray));

    
}

const storePrices = async () => {
const csvJson = await csv().fromFile(localPath)
await injectPricesTable(csvJson);
}

module.exports = storePrices;