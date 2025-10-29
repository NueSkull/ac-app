const db = require("../db/connection");

async function seed() {
    await db.query('DROP TABLE IF EXISTS user_lookup;')
    await db.query('DROP TABLE IF EXISTS pricing;')
    await db.query('DROP TABLE IF EXISTS users;')
    await db.query('DROP TABLE IF EXISTS stock;')
    await db.query('DROP TABLE IF EXISTS prices;')
    
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
        low_break FLOAT,
        high_break FLOAT,
        percentage INT, 
        personalisation FLOAT);`);

    await db.query(`CREATE TABLE user_lookup (
        c_account_number VARCHAR PRIMARY KEY,
        subdom VARCHAR REFERENCES users(subdom));`)

        
    await db.query(`CREATE TABLE stock (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        alpha_order VARCHAR,
        size_value VARCHAR,
        stock_level VARCHAR);`);

        
    await db.query(`CREATE TABLE prices (
        sku VARCHAR PRIMARY KEY,
        primary_sku VARCHAR,
        price FLOAT(2)
        );`);

    await db.query(`INSERT INTO users (subdom, company_name, address_line_1, address_line_2, address_line_3, post_code, telephone) 
        VALUES ('ac','Apparel Catalogue', '', '', '', '', ''),
        ('marksempire','Ecom Test', 'Unit 112', 'Deeside', 'Flintshire', 'CH5 2UA', '01234567890');`)

    await db.query(`INSERT INTO user_lookup (c_account_number, subdom) VALUES ('EA051','marksempire');`)

    await db.query(`INSERT INTO pricing (customer, type, brand, low_break, high_break, percentage, personalisation) 
        VALUES ('ac','Price','',0,999,100,0),
        ('marksempire','Brand','Anthem',5,15,5,5),
        ('marksempire','Price','',2.50,15.75,40,2.5),
        ('marksempire','Qty','',1,10,30,0.00);`)

}

seed();