const db = require("../db/connection");
const { getPricingF } = require('./pricinglogic');

  const languageKeys = {
  "en": ["en-GB", "GBP"],
  "de": ["de-DE", "EUR"],
  "fr": ["fr-FR", "EUR"],
  "nl": ["nl-NL", "EUR"],
  "ga": ["en-IE", "EUR"]
  }

exports.getStyleInfo = async (sku, brand, subdom, lang) => {

    let returningPrices = '';

    async function prettyPrices(prices) {
        const prettiedPricing = prices.map((size) => {
            const flooredPrice = Math.floor(size.price);
            const leftOvers = size.price % flooredPrice;
            let newPrice = size.price;
            if(leftOvers <= 0.50) {
                newPrice = flooredPrice + 0.45;
            } else {
                newPrice = flooredPrice + 0.95;
            }

            return {...size, price: newPrice}
        })

        return prettiedPricing
    }

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
                SELECT s.size_value, a.stock_level, p.price 
                FROM stock AS a
                JOIN prices_${lang} AS p ON a.sku = p.sku 
                JOIN sizes AS s ON a.sku = s.sku 
                WHERE s.primary_sku = $1
                ORDER BY s.alpha_order ASC;
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

                if(priceMatrix[0].pretty_pricing === true) {
                    returningPrices = await prettyPrices(returningPrices);
                }

                if(filteredForQty.length > 0) {
                    returningPrices = await qtyMarkups(filteredForQty, returningPrices)
                }
            }


            returningPrices.styleInfo.numFormat = languageKeys[lang][0];
            returningPrices.styleInfo.currency = languageKeys[lang][1];
            return returningPrices;
}