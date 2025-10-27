const db = require("../db/connection");
const format = require('pg-format');

exports.getPricingF = async (subdom) => {
    const query = {
        text: 'SELECT * FROM pricing WHERE customer = $1',
        values: [subdom],
    };
    
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (err) {
        console.error(`Error fetching pricing rules for ${subdom}:`, err);
        throw err; 
    }
};

exports.updatePricingF = async (subdom, rules) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const deleteQuery = {
            text: 'DELETE FROM pricing WHERE customer = $1',
            values: [subdom],
        };
        await client.query(deleteQuery);

        let insertedCount = 0;
        if (rules && rules.length > 0) {
            
            const values = rules.map(rule => [
                subdom, 
                rule.type,
                rule.brand,
                rule.low_break,
                rule.high_break,
                rule.percentage,
                rule.personalization
            ]);

            const insertQuery = format(
                'INSERT INTO pricing (customer, type, brand, low_break, high_break, percentage, personalisation) VALUES %L',
                values
            );

            const insertResult = await client.query(insertQuery);
            insertedCount = insertResult.rowCount;
        }

        await client.query('COMMIT');

        return { 
            success: true, 
            message: `Pricing rules updated successfully. Removed old rules and inserted ${insertedCount} new rules for ${subdom}.`
        };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error in updatePricingF transaction for ${subdom}:`, err);
        throw err;
    } finally {
        client.release();
    }
};

