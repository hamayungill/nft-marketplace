const RarityReward = require('../../models/rarityReward.model')
const Pizza = require('../../models/pizza.model')

// API to get pizza with rariry reward list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, nftIds } = req.query
        nftIds = JSON.parse(nftIds);
        let pizzas = await Pizza.find({_pizzaId: {$in:nftIds}}, {image: 1, _pizzaId: 1});
        // page = page !== undefined && page !== '' ? parseInt(page) : 1
        // limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        // const total = await RarityReward.countDocuments({})

        // if (page > Math.ceil(total / limit) && total > 0)
        //     page = Math.ceil(total / limit)

        // const rarityReward = await RarityReward.aggregate([
        //     { $sort: { createdAt: -1 } },
        //     { $skip: limit * (page - 1) },
        //     { $limit: limit },
        //     {
        //         $lookup: {
        //             from: 'pizzas',
        //             localField: 'pizzaId',
        //             foreignField: '_id',
        //             as: 'pizzaObj'
        //         }
        //     }, 
        //     {
        //         $unwind: '$pizzaObj',
        //     },
        //     {
        //         $project: {
        //             price: 1, pizzaId: 1, image: '$pizzaObj.image'    
        //         }
        //     }
        // ])

        return res.send({
            success: true, message: 'Pizzas fetched successfully',
            data: {
                pizza: pizzas,
                // pagination: {
                //     page, limit, total,
                //     pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                // }
            }
        })
    } catch (error) {
        return next(error)
    }
}

// API to sent rarity Reward
exports.sendReward = async (req, res, next) => {
    try {
        const { _pizzaId, price, userId } = req.body

        const pizzaObj = await Pizza.findOne({_pizzaId : _pizzaId}) 

        if(pizzaObj._id){
            let pizzaId = pizzaObj._id     
            
            if(pizzaId){
                let isExist = await RarityReward.findOne({ pizzaId })
                if(isExist){
                    return res.send({ success: true, message: 'Rarity Reward already sent.' })
                }
            }
            const rarityReward = await RarityReward.create({
                price, 
                pizzaId,
                creatorId: userId
            })
            if(rarityReward){
                await Pizza.findByIdAndUpdate({ _id: pizzaId}, {rewardSent: true})
            }
            return res.send({ success: true, message: 'Rarity Reward has been sent, successfully', rarityReward })
        }
 } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'rarityReward')
        else
            return next(error)
    }
}