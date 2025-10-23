const { retrieveSettings, storeSettings } = require('../models/userSettings')

exports.getUserSettings = async (req, res, next) => {
  const userAdded = await retrieveSettings(req.params.userid)
    res.status(200).send(userAdded);
}

exports.storeSettings = async (req, res, next) => {
  const userUpdated = await storeSettings(req.params.userid, req.body)
    res.status(200).send({userUpdated});
}