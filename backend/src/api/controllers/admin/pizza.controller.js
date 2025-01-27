const Pizza = require('../../models/pizza.model')

//helper Function
function dateFormat(date){
    let dateList = date.split("-")
    //[year , month , day]
    return [parseInt(dateList[0]),parseInt(dateList[1]),parseInt(dateList[2])]
}
// API to get pizza list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        let countDocument = {_pizzaId: { $exists: true}}
        let dbQuery=[
            {
                $match: {
                    _pizzaId: { $exists: true}
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'currentOwnerId',
                    foreignField: '_id',
                    as: 'currentOwner'
                }
            }, 
            {
                $unwind: '$currentOwner',
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            {
                $unwind: '$creator'
            },
            {
                $project: {
                    _id: 1, _pizzaId: 1, name: 1, imageCloudinaryUrl: 1,  image: 1, price: 1, isActive: 1, rarity: 1, currentOwnerId: 1, creatorId: 1, createdAt: 1, rewardSent: 1, blockNumber: 1 , contentIpfs: 1, creatorAddress: '$creator.address'}
            },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },

        ]

         // search filter
         let searchFilter = {}
         // Rarity, startDate, endDate
         const { rarity, startDate, endDate } = req.body
         if(rarity){
             searchFilter["rarity"] = typeof(rarity) === Number ? parseInt(rarity):parseFloat(rarity)
         }
         // date filter
         if(startDate){
             searchFilter["createdAt"] = { $gte: new Date(startDate) }
         }
         if(endDate){
            if(startDate){
                let sFilter = searchFilter["createdAt"]
                searchFilter["createdAt"] = { ... sFilter,  $lte: new Date(endDate)}
            }
            let date = dateFormat(endDate)
            searchFilter["createdAt"] = {$lt: new Date(`${date[0]}-${date[1]}-${date[2]+1}`)}
         }
         if(startDate === endDate){
            if(endDate){
                let date = dateFormat(endDate) 
                searchFilter["createdAt"] = { $gte: new Date(startDate), $lt: new Date(`${date[0]}-${date[1]}-${date[2]+1}`)}
            }
        }
         if( rarity || startDate || endDate){
             countDocument = searchFilter
             var searchTerm=  {$match: searchFilter}
             dbQuery.unshift(searchTerm)
         }

        const total = await Pizza.countDocuments(countDocument)
        const pizzas = await Pizza.aggregate(dbQuery)


        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        return res.send({
            success: true, message: 'Pizzas fetched successfully',
            data: {
                data: pizzas,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}


// API to get pizzas stats
exports.stats = async (req, res, next) => {
    try {
        const total = await Pizza.countDocuments()
        return res.send({
            success: true, 
            message: 'Pizzas Statistics fetched successfully.',
            data: {
                total_pizzas: total,
            }
        })
    } catch (error) {
        return next(error)
    }
}