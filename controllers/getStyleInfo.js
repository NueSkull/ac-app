const { getStyleInfo } = require('../models/getStyleInfo')

exports.getStyleInfo = async (req, res, next) => {
    const {sku, brand, subdom} = req.params;
    const styleInfo = await getStyleInfo(sku, brand, subdom)
    res.status(200).send({styleInfo});
}