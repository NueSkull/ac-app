const db = require("../db/connection");
const { getPricingF } = require('./pricinglogic');

exports.getStyleInfo = async (sku, brand, subdom) => {

    let returningPrices = '';

    async function brandMarkup(brand, prices) {
        const updatedPrices = prices.map((size) => {
            for(const rule in brand) {
                if(size.price >= brand[rule].low_break && size.price <= brand[rule].high_break) {
                    return {...size, price: (((((size.price / 100) * (brand[rule].percentage + 100)) * 100) / 100) + brand[rule].personalisation).toFixed(2)}
                }
            }

            return size;
        })
        return updatedPrices
    }

    async function priceMarkup(pricemarkup, prices) {
        const updatedPrices = prices.map((size) => {
            for(const rule in pricemarkup) {
                if(size.price >= pricemarkup[rule].low_break && size.price <= pricemarkup[rule].high_break) {
                    return {...size, price: (((((size.price / 100) * (pricemarkup[rule].percentage + 100)) * 100) / 100) + pricemarkup[rule].personalisation).toFixed(2)}
                }
            }

            return size;
        })
        return updatedPrices
    }

async function qtyMarkups(qtys, prices) {
    const updatedPrices = prices.map((size) => {
        const newQtysArray = [];
        let newQtyLabel = ''; 

        for (const rule in qtys) {

            const qtyCost = ((((size.price / 100) * (100 - qtys[rule].percentage)) * 100) / 100).toFixed(2);
            
            newQtysArray.push({qtyAmount: qtys[rule].low_break, qtyCost: qtyCost + qtys[rule].personalisation});
        }

        return {
            ...size,
            qtys: newQtysArray
        };
    });
    
    return updatedPrices;
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

            if(subdom) {
                const priceMatrix = await getPricingF(subdom);

                if(brand) {
                    const filterForBrand = priceMatrix.filter((rule) => {
                        return rule.brand === brand;
                    })
                    if(filterForBrand.length > 0) {
                        returningPrices = await brandMarkup(filterForBrand, returningPrices);
                    }
                }

                const filteredForPrice = priceMatrix.filter((rule) => {
                        return rule.type === "Price"
                })

                const filteredForQty = priceMatrix.filter((rule) => {
                        return rule.type === "Qty"
                })

                if(filteredForPrice.length > 0) {
                    returningPrices = await priceMarkup(filteredForPrice, returningPrices)
                }

                if(filteredForQty.length > 0) {
                    returningPrices = await qtyMarkups(filteredForQty, returningPrices)
                }
            }

            return returningPrices;
}