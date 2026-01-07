const { getStyleInfo } = require('../models/getStyleInfo')

exports.getStyleInfo = async (req, res, next) => {
    const {sku, brand, subdom, lang} = req.params;
    const styleInfo = await getStyleInfo(sku, brand, subdom, lang)
    res.status(200).send({styleInfo});
}