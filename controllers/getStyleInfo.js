const { getStyleInfo } = require('../models/getStyleInfo')

exports.getStyleInfo = async (req, res, next) => {
    try {
    const {userid, sku} = req.params;
    console.log(`Captured the following in controller ${userid} ${sku}`)
    const styleInfo = await getStyleInfo(userid, sku)
    res.status(200).send({styleInfo});
    } catch(err) {
        next(err)
    }
}