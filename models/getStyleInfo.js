const db = require("../db/connection");

exports.getStyleInfo = async (userid, sku) => {
    console.log(`Style info request received for ${sku}`);
            const query = `
                SELECT a.size_value, a.stock_level, p.price 
                FROM stock AS a
                JOIN prices_apparel_catalogue AS p ON a.sku = p.sku
                WHERE a.primary_sku = $1
                ORDER BY a.alpha_order ASC;
            `;
            const response = await db.query(query, [sku]);
            return response.rows;
}