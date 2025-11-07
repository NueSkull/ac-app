const { getFromPrice } = require('../models/getFromPrice')

exports.getFromPrice = async (req, res, next) => {
    const {sku, brand, subdom} = req.params;
    const fromPrice = await getFromPrice(sku, brand, subdom)
    res.status(200).send({fromPrice});
}