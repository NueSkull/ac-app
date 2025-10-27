const { getStyleInfo } = require('../models/getStyleInfo')

exports.getStyleInfo = async (req, res, next) => {
    const {sku, brand} = req.params;
    const styleInfo = await getStyleInfo(sku, brand)
    res.status(200).send({styleInfo});
}