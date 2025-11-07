const db = require("../db/connection");
const { getPricingF } = require("./pricinglogic");

exports.getFromPrice = async (sku, brand, subdom) => {
  console.log(`From price request - ${sku} - ${brand} - ${subdom}`);

  const productPrice = await db.query(
    "SELECT price FROM prices WHERE LEFT(sku, 5) = $1;",
    [sku]
  );

  let fromPrice = 999;

  // Get initial from price before any logic

  for (const price in productPrice.rows) {
    if (productPrice.rows[price].price < fromPrice) {
      fromPrice = productPrice.rows[price].price;
    }
  }

  // Pricing Logics

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
        fromPrice = await brandMarkup(filterForBrand, fromPrice);
      }
    }

    const filteredForPrice = priceMatrix.filter((rule) => {
      return rule.type === "Price";
    });

    const filteredForQty = priceMatrix.filter((rule) => {
      return rule.type === "Qty";
    });

    if (filteredForPrice.length > 0) {
      fromPrice = await priceMarkup(filteredForPrice, fromPrice);
    }

    if (filteredForQty.length > 0) {
      fromPrice = await qtyMarkups(filteredForQty, fromPrice);
    }
  }

  return fromPrice;
};
