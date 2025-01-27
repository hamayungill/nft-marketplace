const RarityReward = require('../../models/rarityReward.model')
const { checkDuplicate } = require('../../../config/errors')
const Pizza = require('../../models/pizza.model')

// API to sent rarity Reward
exports.sendReward = async (req, res, next) => {
    try {
        const { pizzaId } = req.body
        if(pizzaId){
            let isExist = await RarityReward.findOne({ pizzaId })
            if(isExist){
                return res.send({ success: true, message: 'Rarity Reward already sent.' })
            }
        }
        const rarityReward = await RarityReward.create({...req.body})
        if(rarityReward){
          await Pizza.findByIdAndUpdate({ _id: req.body.pizzaId}, {rewardSent: true})
        }
        return res.send({ success: true, message: 'Rarity Reward has been sent, successfully', rarityReward })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'rarityReward')
        else
            return next(error)
    }
}