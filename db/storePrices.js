const csv = require('csvtojson');
const db = require("../db/connection");
const format = require("pg-format");
const jsonToArray = require('../utils/jsonToArray');

const injectPricesTable = async (csvJson, tableName) => {
    const importTable = `${tableName}_import`;
    
    await db.query(`DROP TABLE IF EXISTS ${importTable};`);
    await db.query(`CREATE TABLE ${importTable} (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        price FLOAT(2)
        );`);

    const csvArrayd = await jsonToArray(csvJson);
    const skudArray = csvArrayd.map((row) => {
        return [row[0], row[0].substring(0, 9), row[1]];
    });

    const startTime = Date.now();
    await db.query(format(`INSERT INTO ${importTable} (sku, primary_sku, price) VALUES %L ON CONFLICT (sku) DO NOTHING;`, skudArray));
    
    const elapsedTime = Date.now() - startTime;
    console.log(`${tableName} insertion finished after ${(elapsedTime / 1000).toFixed(3)} s`);

    await db.query(`DROP TABLE IF EXISTS ${tableName};`);
    await db.query(`ALTER TABLE ${importTable} RENAME TO ${tableName};`);
};

const storePrices = async (localPath, fileName) => {
    const langSuffix = fileName.replace('price_list', '').replace('.csv', '').replace('_', '');
    const tableName = langSuffix ? `prices_${langSuffix}` : 'prices';

    const csvJson = await csv().fromFile(localPath);
    await injectPricesTable(csvJson, tableName);
};

module.exports = storePrices;