const { getFromPrice } = require('../models/getFromPrice')

exports.getFromPrice = async (req, res, next) => {
    const {sku, brand, subdom, lang, curr} = req.params;
    const fromPrice = await getFromPrice(sku, brand, subdom, lang, curr)
    res.status(200).send({fromPrice});
}