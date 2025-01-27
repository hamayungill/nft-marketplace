const fs = require('fs')
const Ingredients = require('../../models/Ingredients.model')
const Artist = require('../../models/artist.model')
const Pizzas = require('../../models/pizza.model')
const Users = require('../../models/users.model')
const Categories = require('../../models/categories.model')
const Faqs = require('../../models/faq.model')
const { addImage, addContent } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')
const IngredientData =require('../../../Data/Ingredients')
const web3 = require('../../utils/web3');
const ObjectId = require('mongoose').Types.ObjectId
const { _upsertIngredient } = require("../../utils/web3")
//edit
// const ingredients = require('../../../Data/ingredients.js');

// API to create ingredient
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            console.log("images: ",image)
            const {ipfs, cloudinaryUrl}  = await addImage(image.path)
            payload.image = ipfs
            payload.imageCloudinaryUrl = cloudinaryUrl
        }
        if (req.files && req.files.pizzaImage) {
            const image = req.files.pizzaImage[0]
            const {ipfs, cloudinaryUrl} = await addImage(image.path)
            payload.pizzaImage = ipfs
            payload.pizzaImageCloudinaryUrl = cloudinaryUrl
        }
        const ingredient = await Ingredients.create(payload)
        return res.send({ success: true, message: 'Ingredient created successfully', data:ingredient })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Ingredient')
        else
            return next(error)
    }
}

// API to edit ingredient
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            const imgData = fs.readFileSync(image.path)
            payload.image = await addImage(imgData)
        }

        const ingredient = await Ingredients.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Ingredient updated successfully', ingredient })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Category')
        else
            return next(error)
    }
}

// API to delete ingredient
exports.delete = async (req, res, next) => {
    try {
        const { ingredientId } = req.params
        if (ingredientId) {
            const ingredient = await Ingredients.deleteOne({ _id: ingredientId })
            if (ingredient && ingredient.deletedCount)
                return res.send({ success: true, message: 'Ingredient deleted successfully', ingredient })
            else return res.status(400).send({ success: false, message: 'Ingredient not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Ingredient Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a ingredient
exports.get = async (req, res, next) => {
    try {
        const { ingredientId } = req.params
        if (ingredientId) {
            const ingredient = await Ingredients.findOne({ _id: ingredientId }, { _id: 1, name: 1, image: 1, isActive: 1, categoryId: 1, rarity: 1, price: 1, artistAddress: 1, _ingredientId: 1 }).lean(true)
            if (ingredient)
                return res.json({ success: true, message: 'Ingredient retrieved successfully', ingredient })
            else return res.status(400).send({ success: false, message: 'Ingredient not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Ingredient Id is required' })
    } catch (error) {
        return next(error)
    }
}
//helper Function
function dateFormat(date){
    let dateList = date.split("-")
    //[year , month , day]
    return [parseInt(dateList[0]),parseInt(dateList[1]),parseInt(dateList[2])]
}
// API to get ingredient list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10


        let countDocument = {
            _ingredientId: { $exists: true}            
        }
        let dbQuery=[
            { $match: {
                _ingredientId: { $exists: true}
                    }
            },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categoryId',
                    as: 'categories'
                }
            }, {
                $unwind: '$categories'
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'ownedBy',
                    as: 'user'
                }
            }, {
                $unwind: {path: '$user', preserveNullAndEmptyArrays: true} 
            },
            {
                $project: {
                    _id: 1, name: 1, isActive: 1, rarity: 1, layerNum: 1, createdAt: 1, categoryId: 1, price: 1, ownedBy: '$user.username' , categoryName: '$categories.name' , imageCloudinaryUrl: 1 , pizzaImageCloudinaryUrl: 1 , artistAddress: 1 , maxMints: 1 , alreadyMinted: 1 , _ingredientId: 1
                }
            },
            { $sort: { layerNum: 1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
        ]

        // search filter
        let searchFilter = {}
        // Name, Price, Rarity, startDate, endDate
        const { name, startDate, endDate } = req.body
        console.log("startDate : ",startDate , " endDate : ",endDate)
        if(name){
            searchFilter["name"] = { $regex: new RegExp(name), $options: "si" }
        }
        // if(price){
        //     searchFilter["price"] = typeof (parseInt(price)) === Number ? parseInt(price) : parseFloat(price)
        // }
        // if(rarity){
        //     searchFilter["rarity"] = parseFloat(rarity)
        // }

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

        if(name || startDate || endDate){
            countDocument = searchFilter
            console.log("searchFilter : ",searchFilter)
            var searchTerm=  {$match: searchFilter}
            console.log("searchTerm : ",searchTerm)
            dbQuery.unshift(searchTerm)
            console.log("dbQuery : ",dbQuery)
        }
   
        const total = await Ingredients.countDocuments(countDocument)

        const ingredient = await Ingredients.aggregate(dbQuery)
        console.log("ingredient : ",ingredient)

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        return res.send({
            success: true, message: 'Ingredients fetched successfully',
            data: {
                ingredients:ingredient,
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

// API to get ingredient stats
exports.stats = async (req, res, next) => {
    try {
        const ingredients = await Ingredients.countDocuments({_ingredientId: { $exists: true}});
        const pizzas = await Pizzas.countDocuments({_pizzaId : { $exists: true }})
        const artists = await Artist.countDocuments()
        const categories = await Categories.countDocuments()
        const faqs = await Faqs.countDocuments()
        return res.send({
            success: true, 
            message: 'Ingredients Statistics fetched successfully.',
            data: {
                total_ingredients: ingredients,
                total_pizzas: pizzas,
                total_artists: artists,
                total_categories: categories,
                total_faqs: faqs,
            }
        })
    } catch (error) {
        return next(error)
    }
}

//edit
exports.createIng = async (req, res , next)=>{
    try{
       const value = await IngredientData.readXslx()

       console.log("value: ",value)
       let payload = []
       let ingData = {name: '' , pizzaImage: '', image:'' , imageCloudinaryUrl:'' , pizzaImageCloudinaryUrl:'' , price: '0.01', rarity:100 , artistAddress: '0xC5F8606C78063166256A33813f104A4DDcC648Ab',maxMints:100 , alreadyMinted :0 , _ingredientId: 0 , layerNum: 0 }
       for(let i=0 ; i < value.length ; i++){
           const item = value[i]
           ingData.name = item.name
           ingData.layerNum = item.layerNum
           //I don't Cast here String to new Object Id
           let cat = item?.category?.trim()
           console.log("item category id", cat)
           ingData.categoryId = ObjectId(`${cat}`)
           ingData.artistAddress = item.artistAddress
           ingData.type = item.type
           //web3 _upsetIngredient Function is Should be call here But At the moment I just take index as Id

           if(item.RAW){
                const {ipfs, cloudinaryUrl}  = await addImage(item.RAW)
                ingData.image =ipfs
                ingData.imageCloudinaryUrl = cloudinaryUrl

                console.log("ipfs: ",ipfs)
                console.log("cloudinaryUrl ",cloudinaryUrl)
           }
           if(item.BAKED){
                const {ipfs, cloudinaryUrl}  = await addImage(item.BAKED)
                ingData.pizzaImage = ipfs
                ingData.pizzaImageCloudinaryUrl = cloudinaryUrl

                console.log("ipfs: ",ipfs)
                console.log("cloudinaryUrl ",cloudinaryUrl)
           }
            //    ingredientTokenURI, price, artistAddress, categoryType, maxMints, name
            let _id = await _upsertIngredient(ingData?.pizzaImageCloudinaryUrl, '0.01', ingData?.artistAddress, ingData?.type, 1000,  ingData?.name)
            ingData._ingredientId = _id 
            console.log("_ingredientId in controller = ", _id )
            payload.push(ingData)
            ingData = {name: '' , pizzaImage: '', image:'' , imageCloudinaryUrl:'' , pizzaImageCloudinaryUrl:'' , price: '0.01', rarity:100 , artistAddress: '0xC5F8606C78063166256A33813f104A4DDcC648Ab',maxMints:100 , alreadyMinted :0 , _ingredientId: 0 , layerNum: 0 }
       }
       console.log("payload: ", payload)
       const ingredient = await Ingredients.create(payload)
       return res.send({ success: true, message: 'Ingredient created successfully'})
    }
    catch(error){
        return next(error)
    }
}
// exports.createIng = async (req,res,next)=>{
//     try{
//         let payload = await ingredients
//         const ingredient = await Ingredients.create(payload)
//         return res.send({ success: true, message: 'Ingredient created successfully' , data:ingredient })
//     }
//     catch(error){
//         return next(error);
//     }
// }