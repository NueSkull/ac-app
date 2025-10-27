const { getPricingF, updatePricingF } = require('../models/pricinglogic');

exports.getPricing = async (req, res, next) => {
    const subdom = req.params.ac;
    
    try {
        const rules = await getPricingF(subdom);
        res.status(200).send(rules);
    } catch (err) {
        console.error('Error in getPricing controller:', err);
        next(err);
    }
};

exports.updatePricing = async (req, res, next) => {
    const subdom = req.params.ac;
    const rules = req.body; 

    try {
        const updateResult = await updatePricingF(subdom, rules);
        res.status(200).send(updateResult);
    } catch (err) {
        console.error('Error in updatePricing controller:', err);
        next(err);
    }
};

