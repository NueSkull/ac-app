const { getStyleInfo } = require('../models/getStyleInfo')

exports.getStyleInfo = async (req, res, next) => {
    const sku = req.params.sku;
    const styleInfo = await getStyleInfo(sku)
    res.status(200).send({styleInfo});
}