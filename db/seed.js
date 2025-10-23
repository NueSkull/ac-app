const db = require("../db/connection");

async function seed() {
    await db.query('DROP TABLE IF EXISTS users;')
    await db.query('DROP TABLE IF EXISTS pricing;')
    
    await db.query(`CREATE TABLE users (
        subdom VARCHAR PRIMARY KEY,
        company_name VARCHAR NOT NULL,
        address_line_1 VARCHAR,
        address_line_2 VARCHAR,
        address_line_3 VARCHAR,
        post_code VARCHAR,
        telephone VARCHAR); `);
    
    await db.query(`CREATE TABLE pricing (
        key SERIAL PRIMARY KEY,
        customer VARCHAR NOT NULL REFERENCES users(subdom),
        type VARCHAR NOT NULL,
        brand VARCHAR,
        low_break VARCHAR,
        high_break VARCHAR,
        percentage INT, 
        personalisation FLOAT);`);

}

seed();