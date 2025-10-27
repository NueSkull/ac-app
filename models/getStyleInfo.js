const db = require("../db/connection");
const { getPricingF } = require('./pricinglogic');

exports.getStyleInfo = async (sku, brand, subdom) => {

    let returningPrices = '';

    async function brandMarkup(brand, prices) {
        const updatedPrices = prices.map((size) => {
            for(const rule in brand) {
                if(size.price >= brand[rule].low_break && size.price <= brand[rule].high_break) {
                    return {...size, price: Math.ceil(((size.price / 100) * (brand[rule].percentage + 100)) * 100) / 100}
                }
            }

            return size;
        })
        return updatedPrices
    }
    
    console.log(`Style info request received for ${sku} - ${brand} - ${subdom}`);
            const query = `
                SELECT a.size_value, a.stock_level, p.price 
                FROM stock AS a
                JOIN prices AS p ON a.sku = p.sku
                WHERE a.primary_sku = $1
                ORDER BY a.alpha_order ASC;
            `;

            const response = await db.query(query, [sku]);
            returningPrices = response.rows;

            if(subdom && brand) {
                const priceMatrix = await getPricingF(subdom);
                const filterForBrand = priceMatrix.filter((rule) => {
                    return rule.brand === brand;
                })
                if(filterForBrand.length > 0) {
                  returningPrices = await brandMarkup(filterForBrand, returningPrices);
                }
            }

            return returningPrices;
}