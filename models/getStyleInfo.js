const db = require("../db/connection");

exports.getStyleInfo = async (userid, sku) => {
    console.log(`Style info request received for ${sku}`);
    
    // 1. Sanitise the user ID to create a safe table name suffix
    const tableSuffix = userid
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_');

    // 2. Define the dynamic (primary) query text
    // (Re-typed to remove any hidden non-breaking space characters)
    const dynamicQueryText = `
        SELECT a.size_value, a.stock_level, p.price 
        FROM stock AS a
        JOIN prices_${tableSuffix} AS p ON a.sku = p.sku
        WHERE a.primary_sku = $1
        ORDER BY a.alpha_order ASC;
    `;

    try {
        // 3. Try the dynamic query first
        const result = await db.query(dynamicQueryText, [sku]);
        return result.rows;

    } catch (err) {
        // 4. Check if the error is "undefined_table" (PostgreSQL code)
        if (err.code === '42P01') {
            console.warn(
                `Table 'prices_${tableSuffix}' not found. Falling back to 'prices_apparel_catalogue'.`
            );

            // 5. Define and run the fallback query
            // (Updated to correct fallback table name and re-typed)
            const fallbackQueryText = `
                SELECT a.size_value, a.stock_level, p.price 
                FROM stock AS a
                JOIN prices_apparel_catalogue AS p ON a.sku = p.sku
                WHERE a.primary_sku = $1
                ORDER BY a.alpha_order ASC;
            `;
            const fallbackResult = await db.query(fallbackQueryText, [sku]);
            return fallbackResult.rows;

        } else {
            // 6. If it's a different error (like the syntax error), log and re-throw
            console.error("SQL Error in getStyleInfo:", err.message);
            throw err;
        }
    }
}