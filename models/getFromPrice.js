const db = require("../db/connection");
const { getPricingF } = require("./pricinglogic");

exports.getFromPrice = async (sku, brand, subdom, lang) => {
  console.log(`From price request - ${sku} - ${brand} - ${subdom} - ${lang}`);

  const productPrice = await db.query(
    `SELECT price FROM prices_${lang} WHERE LEFT(sku, 5) = $1;`,
    [sku]
  );

  const languageKeys = {
  "en": ["en-GB", "GBP"],
  "de": ["de-DE", "EUR"],
  "fr": ["fr-FR", "EUR"],
  "nl": ["nl-NL", "EUR"]
  }

  // en is placeholder for now, will need to get user language later on

  let fromPrice = {"price": 999,
    "numFormat": languageKeys[lang][0],
    "currency": languageKeys[lang][1]
  };

  // Get initial from price before any logic

  for (const price in productPrice.rows) {
    if (productPrice.rows[price].price < fromPrice.price) {
      fromPrice.price = productPrice.rows[price].price;
    }
  }

  // Pricing Logics

  async function prettyPrices(price) {
            const flooredPrice = Math.floor(price);
            const leftOvers = price % flooredPrice;
            let newPrice = price;
            if(leftOvers <= 0.50) {
                newPrice = flooredPrice + 0.45;
            } else {
                newPrice = flooredPrice + 0.95;
            }

        return newPrice
    }

  async function brandMarkup(brand, price) {
    let newPrice = price
      for (const rule in brand) {
        if (
          price >= brand[rule].low_break &&
          price <= brand[rule].high_break
        ) {
          newPrice = ((
                ((price / 100) * (brand[rule].percentage + 100) * 100) /
                  100
              ) + brand[rule].personalisation).toFixed(2);
          };
        }
        return newPrice;
      }

  async function priceMarkup(pricemarkup, price) {
    let newPrice = price
      for (const rule in pricemarkup) {
        if (
          price >= pricemarkup[rule].low_break &&
          price <= pricemarkup[rule].high_break
        ) {
          newPrice = ((
                ((price / 100) *
                  (pricemarkup[rule].percentage + 100) *
                  100) /
                  100
              ) + pricemarkup[rule].personalisation).toFixed(2);
          };
        }
        return newPrice;
      }

  async function qtyMarkups(qtys, price) {
return price;
// left for now
  }

  if (subdom) {
    const priceMatrix = await getPricingF(subdom);

    if (brand) {
      const filterForBrand = priceMatrix.filter((rule) => {
        return rule.brand === brand;
      });
      if (filterForBrand.length > 0) {
        fromPrice.price = await brandMarkup(filterForBrand, fromPrice.price);
      }
    }

    const filteredForPrice = priceMatrix.filter((rule) => {
      return rule.type === "Price";
    });

    const filteredForQty = priceMatrix.filter((rule) => {
      return rule.type === "Qty";
    });

    if (filteredForPrice.length > 0) {
      fromPrice.price = await priceMarkup(filteredForPrice, fromPrice.price);
    }

    if(priceMatrix[0].pretty_pricing === true) {
        fromPrice.price = await prettyPrices(fromPrice.price);
    }

    if (filteredForQty.length > 0) {
      fromPrice.price = await qtyMarkups(filteredForQty, fromPrice.price);
    }
  }

  return fromPrice;
};
