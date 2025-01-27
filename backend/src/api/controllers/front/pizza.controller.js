const Pizza = require('../../models/pizza.model')
const { addImage, addContent } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')
const ObjectId = require('mongoose').Types.ObjectId
const Ingredient = require('../../models/Ingredients.model')
const UserIngrdient = require('../../models/userIngredients.model')
const TempPizza = require('../../models/tempPizza.model')
const calculateRarity = require('../../utils/calculateRarity')
var curl = require("curl");
var fs = require('fs');
const {getCurrentBlockNumber} = require("../../utils/web3")

// API to create pizza
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        const { ingredientIds, userIngredientIds } = payload;

        if (!ingredientIds) {
            return res.send({ success: false, message: 'Ingredients required' })
        }
        if (!userIngredientIds) {
            return res.send({ success: false, message: 'User Ingredients required' })
        }

        const ingredientsIDsArr = []
        for (let i = 0; i < ingredientIds.length; i++) {
            const e = ingredientIds[i];
            ingredientsIDsArr.push(ObjectId(e))
        }

        const ingredientsTraitsData = await Ingredient.aggregate([
            {
                $match: {
                    _id: { $in: ingredientsIDsArr },
                    _ingredientId: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categoryId',
                    as: 'ingredeintCatgegory',
                },
            },
            {
                $unwind: '$ingredeintCatgegory',
            },
            {
                $project: {
                    type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1,
                }
            }
        ])

        let attributes = []

        let ingredientsArray = await Ingredient.aggregate(
            [
                {
                    $match: {
                        _ingredientId: { $exists: true }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        foreignField: '_id',
                        localField: 'categoryId',
                        as: 'ingredeintCatgegory',
                    },
                },
                {
                    $unwind: '$ingredeintCatgegory',
                },
                {
                    $project: {
                        type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1,
                    }
                }
            ]
        )
        let baseInserted = false
        let sauceInserted = false
        let cheeseInserted = false

        Promise.all(ingredientsArray.map((e) => {
            if(e.type === "base"){
                if(!baseInserted){
                    attributes.push({ 
                        trait_type: "Base",
                        value: "NONE"
                    })
                    baseInserted = true
                }
            }else if (e.type === "sauce"){
                if(!sauceInserted){
                    attributes.push({ 
                        trait_type: "Sauce",
                        value: "NONE"
                    })
                    sauceInserted = true
                }
            }
            // else if(e.type === "cheese"){
            //     if(!cheeseInserted){
            //         attributes.push({ 
            //             trait_type: "Cheese",
            //             value: "NONE"
            //         })
            //         cheeseInserted = true
            //     }
              
            // }
             else {
                attributes.push({ 
                    trait_type: e.name,
                    value: "NO"
                })
            }
        }))

        Promise.all(ingredientsTraitsData.map((e) => {
            let type = e.type
            let mintedID = e._ingredientId
            if (e.type === "base") {
                Promise.all(attributes.map((traits, index) => {
                    if(traits.trait_type === "Base"){
                        attributes[index].value = e.name
                        return
                    }
                }))
            } else if (e.type === "sauce") {
                Promise.all(attributes.map((traits, index) => {
                    if(traits.trait_type === "Sauce"){
                        attributes[index].value = e.name
                        return
                    }
                }))
            } 
            // else if (e.type === "cheese") {
            //     Promise.all(attributes.map((traits, index) => {
            //         if(traits.trait_type === "Cheese"){
            //             attributes[index].value = e.name
            //             return
            //         }
            //     }))
            // }
            else {
                Promise.all(attributes.map((traits, index) => {
                    let nameStr1 = e.name
                    let nameStr2 = traits.trait_type
                    if (nameStr1 === nameStr2) {
                        attributes[index].value = "YES"
                    }
                }))
            }
        })
        )

        if (payload.image) {
            const data = payload.image.split(",")
            const img = Buffer.from(data[1], "base64");
            let imageIpfs = await addImage(img)
            const totalPizzas = await Pizza.countDocuments({});
            let contentIpfs = await addContent({
                "name": "Pizza",
                "description": "",
                "image": imageIpfs,
                attributes
            })
            payload.image = imageIpfs
            payload.contentIpfs = contentIpfs
        }

        const UIngredientsIDsArr = []
        for (let i = 0; i < userIngredientIds.length; i++) {
            const e = userIngredientIds[i];
            UIngredientsIDsArr.push(ObjectId(e))
        }

        // to find the average of ingredient prices 
        const ingredientAvg = await Ingredient.aggregate([
            {
                $match: {
                    _id: {
                        $in: ingredientsIDsArr
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    rarity: { $avg: "$price" },
                }
            },
        ])
        if (!ingredientAvg.length) {
            return res.send({ success: false, message: 'Invalid Igredients' })
        }

        let data = {
            ...payload,
            rarity: ingredientAvg[0].rarity,
            ingredients: ingredientsIDsArr,
            userIngredients: UIngredientsIDsArr
        }

        const pizza = await Pizza.create(data)
        return res.send({ success: true, message: 'Pizza created successfully', data: pizza })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001) {
            checkDuplicate(error, res, 'Pizza')
        } else {
            return next(error)
        }
    }
}

// API to get pizza list top 10
exports.list = async (req, res, next) => {
    try {
        // let { page, limit } = req.query

        // page = page !== undefined && page !== '' ? parseInt(page) : 1
        // limit = limit !== undefined && limit !== '' ? parseInt(limit) : 4

        const pizzas = await Pizza.aggregate([

            {
                $match: {
                    _pizzaId: { $exists: true }
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
                    _id: 1, name: 1, _pizzaId: 1, imageCloudinaryUrl: 1, price: 1, isActive: 1, rarity: 1, currentOwnerId: 1, creatorId: 1, createdAt: 1, currentOwnerName: '$currentOwner.username', creatorName: '$creator.username', ingredients: 1
                }
            },
            { $sort: { rarity: 1 } },
            // { $skip: limit * (page - 1) },
            { $limit: 10 },
        ])

        // const total = await Pizza.countDocuments({ _pizzaId: { $exists: true } })

        // if (page > Math.ceil(total / limit) && total > 0)
        //     page = Math.ceil(total / limit)

        return res.send({
            success: true, message: 'Top 10 Rarest Pizzas fetched successfully',
            data: {
                data: pizzas,
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

// API to delete pizza
exports.delete = async (req, res, next) => {
    try {
        const { pizzaId } = req.params
        if (pizzaId) {

            //get pizza
            const pizzaObj = await Pizza.findById(pizzaId)
            console.log('pizzaObj : ',pizzaObj)

            if (!pizzaObj) {
                return res.status(400).send({ success: false, message: 'Pizza not found for given Id' })
            }

            await UserIngrdient.updateMany({ ingredientId : { $in: pizzaObj.ingredients }, userId: pizzaObj.currentOwnerId}, {$inc: { balance: 1 }}, {new : true})
            
            //delete pizza 
            const pizza = await Pizza.deleteOne({ _id: pizzaId })

            if (pizza && pizza.deletedCount){
                // calculating the rarity of the pizza
                calculateRarity?.calculatePizzaRarity()
                return res.send({ success: true, message: 'Pizza deleted successfully', pizza })
            }else{
                return res.status(400).send({ success: false, message: 'Pizza not found for given Id' })
            } 
        } else
            return res.status(400).send({ success: false, message: 'Pizza Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to edit pizza
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (!payload.pizzaObjectId) {
            return res.send({ success: false, message: 'Invalid Payload', pizza })
        }

        // getting tempPizza
        const tempPizza = await TempPizza.findOne({ pizzaObjectId: payload.pizzaObjectId })

        payload.ingredients = tempPizza.ingredients
        payload._id = payload.pizzaObjectId
        payload.contentIpfs = tempPizza.contentIpfs
        payload.image = tempPizza.image
        payload.imageCloudinaryUrl = tempPizza.imageCloudinaryUrl

        const pizzaPreviousVal = await Pizza.findById(payload._id)

        // console.log("helllooooooooooooooooooooooooooooooooooooo")
        // previous added user ingredients, set isUsedStatus to fasle
        // console.log("pizzaPreviousVal = ", pizzaPreviousVal)
        if (pizzaPreviousVal) {
            // console.log("helllloooooooooooooooooooooooooo 1111")
                let arr1 = pizzaPreviousVal?.ingredients
                let arr2 = payload?.ingredients

                console.log("prev ====> ", arr1)
                console.log("new ====> ", arr2)

                let newlyAddedIng = []
                Promise.all(tempPizza?.burnIngredients?.map((e)=> {
                    if(arr2.includes(e)){ newlyAddedIng.push(e) }
                }))

                Promise.all(arr2.map((e)=> {
                    if(!arr1.includes(e)){ newlyAddedIng.push(ObjectId(e)) }
                }))

                let ingArr = newlyAddedIng
                let ownerId = pizzaPreviousVal?.currentOwnerId
                console.log("ingredient needs to decrement", ingArr)
                // console.log("pizza owner", ownerId)

                await UserIngrdient.updateMany({ ingredientId : { $in: ingArr }, userId: ownerId}, {$inc: { balance: -1 }}, {new : true})
        }
        
        // get current block number
        const blockNumber = await getCurrentBlockNumber()
        payload.blockNumber = blockNumber

        const pizza = await Pizza.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })

        // if (pizza) {
        //     // increment the 
        //     await UserIngrdient.updateMany({ ingredientId : { $in: pizza.ingredients }, userId: pizza.currentOwnerId}, {$inc: { balance: 1 }}, {new : true})
        // }

        // deleting the temp pizza
        await TempPizza.deleteOne({ pizzaObjectId: payload.pizzaObjectId })

        // calculating the rarity of the pizza
        calculateRarity?.calculatePizzaRarity()
        
        return res.send({ success: true, message: 'Pizza updated successfully', pizza })

    } catch (error) {
        return next(error)
    }
}

// API to get Pizza Ingredients
exports.getIngredients = async (req, res, next) => {
    try {
        const { pizzaId } = req.params
        if (pizzaId) {

            const pizza = await Pizza.aggregate([
                {
                    $match: { _id: ObjectId(pizzaId) }
                },
                {
                    $lookup: {
                        from: 'useringrdients',
                        foreignField: '_id',
                        localField: 'userIngredients',
                        as: 'userIngredient',
                    },
                },
                {
                    $unwind: '$userIngredient',
                },
                {
                    $lookup: {
                        from: 'ingrdients',
                        foreignField: '_id',
                        localField: 'userIngredient.ingredientId',
                        as: 'ingredients'
                    }
                },
                {
                    $unwind: '$ingredients',
                },
                {
                    $lookup: {
                        from: 'categories',
                        foreignField: '_id',
                        localField: 'ingredients.categoryId',
                        as: 'ingredeintCatgegory',
                    },
                },
                {
                    $unwind: '$ingredeintCatgegory',
                },

                {
                    $project: {
                        _id: 0, _id: '$userIngredient._id', isUsed: '$userIngredient.isUsed', _userIngredientId: '$userIngredient._userIngredientId', Ing_id: '$ingredients._id', name: '$ingredients.name', image: '$ingredients.image', pizzaImage: '$ingredients.pizzaImage', price: '$ingredients.price', catType: '$ingredeintCatgegory.type'
                    }
                }
            ])

            if (pizza) {
                return res.send({ success: true, message: 'Pizza Ingredients Retreived, successfully', pizza })
            }
            else {
                return res.status(400).send({ success: false, message: 'Pizza not found for given Id' })
            }
        } else
            return res.status(400).send({ success: false, message: 'Pizza Id is required' })
    } catch (error) {
        return next(error)
    }
}


// API to random pizza
exports.createRandom = async (req, res, next) => {
    try {
        let payload = req.body


        const { ingredientIds } = payload;

        if (!ingredientIds) {
            return res.send({ success: false, message: 'Ingredients required' })
        }

        const ingredientsIDsArr = []

        for (let i = 0; i < ingredientIds.length; i++) {
            const e = ingredientIds[i];
            if (e) {
                ingredientsIDsArr.push(ObjectId(e))
            }
        }

        const ingredientsTraitsData = await Ingredient.aggregate([
            {
                $match: {
                    _id: { $in: ingredientsIDsArr },
                    _ingredientId: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categoryId',
                    as: 'ingredeintCatgegory',
                },
            },
            {
                $unwind: '$ingredeintCatgegory',
            },
            {
                $project: {
                    type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1
                }
            }
        ])

        let attributes = []

        let ingredientsArray = await Ingredient.aggregate(
            [
                {
                    $match: {
                        _ingredientId: { $exists: true }
                    }
    
                },
                {
                    $lookup: {
                        from: 'categories',
                        foreignField: '_id',
                        localField: 'categoryId',
                        as: 'ingredeintCatgegory',
                    },
                },
                {
                    $unwind: '$ingredeintCatgegory',
                },
                {
                    $project: {
                        type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1,
                    }
                }
            ]
        )

        let baseInserted = false
        let sauceInserted = false
        let cheeseInserted = false

        Promise.all(ingredientsArray.map((e) => {
            if(e.type === "base"){
                if(!baseInserted){
                    attributes.push({ 
                        trait_type: "Base",
                        value: "NONE"
                    })
                    baseInserted = true
                }
            }else if (e.type === "sauce"){
                if(!sauceInserted){
                    attributes.push({ 
                        trait_type: "Sauce",
                        value: "NONE"
                    })
                    sauceInserted = true
                }
            }
            // else if(e.type === "cheese"){
            //     if(!cheeseInserted){
            //         attributes.push({ 
            //             trait_type: "Cheese",
            //             value: "NONE"
            //         })
            //         cheeseInserted = true
            //     }
              
            // } 
            else {
                attributes.push({ 
                    trait_type: e.name,
                    value: "NO"
                })
            }
        }))

        Promise.all(ingredientsTraitsData.map((e) => {
            let type = e.type
            let mintedID = e._ingredientId
            if (e.type === "base") {
                Promise.all(attributes.map((traits, index) => {
                    if(traits.trait_type === "Base"){
                        attributes[index].value = e.name
                        return
                    }
                }))
            } else if (e.type === "sauce") {
                Promise.all(attributes.map((traits, index) => {
                    if(traits.trait_type === "Sauce"){
                        attributes[index].value = e.name
                        return
                    }
                }))
            } 
            // else if (e.type === "cheese") {
            //     Promise.all(attributes.map((traits, index) => {
            //         if(traits.trait_type === "Cheese"){
            //             attributes[index].value = e.name
            //             return
            //         }
            //     }))
            // }
            else {
                Promise.all(attributes.map((traits, index) => {
                    let nameStr1 = e.name
                    let nameStr2 = traits.trait_type
                    if (nameStr1 === nameStr2) {
                        attributes[index].value = "YES"
                    }
                }))
            }
        })
        )

        if (payload.image) {
            const data = payload.image.split(",")
            const img = Buffer.from(data[1], "base64");
            let imagePath = "pizza_image.png"

            // file create krvani hai phr upload kr daini hai 
            let pizzaFile = fs.writeFileSync(imagePath, img)
            console.log("pizzaFile", pizzaFile)

            let {ipfs, cloudinaryUrl} = await addImage("pizza_image.png")
            console.log("imageIpfs", ipfs)
            fs.unlinkSync("pizza_image.png")
            let contentIpfs = await addContent({
                "name": "Pizza",
                "description": "",
                "image": ipfs,
                attributes
            })
            payload.image = ipfs
            payload.imageCloudinaryUrl = cloudinaryUrl, 

            payload.contentIpfs = contentIpfs
            payload.type = "random"
        }

        let data = {
            ...payload,
            rarity: "100",
            ingredients: ingredientsIDsArr,
        }

        const pizza = await Pizza.create(data)
        return res.send({ success: true, message: ' Random Pizza created successfully', data: pizza })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001) {
            checkDuplicate(error, res, 'Pizza')
        } else {
            return next(error)
        }
    }
}

// API to get pizza list by user
exports.pizzasByUser = async (req, res, next) => {
    try {
        // let { page, limit } = req.query
        let { userId } = req.body

        // page = page !== undefined && page !== '' ? parseInt(page) : 1
        // limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        // const total = await Pizza.countDocuments({})

        // if (page > Math.ceil(total / limit) && total > 0)
        //     page = Math.ceil(total / limit)

        const pizzas = await Pizza.aggregate([
            { $sort: { createdAt: -1 } },
            // { $skip: limit * (page - 1) },
            // { $limit: limit },
            { $match: { currentOwnerId: ObjectId(userId), _pizzaId: { $exists: true } } },
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
                    _id: 1, name: 1, image: 1, price: 1, type: 1, isActive: 1, rarity: 1, currentOwnerId: 1, creatorId: 1, createdAt: 1, currentOwnerName: '$currentOwner.username', creatorName: '$creator.username', ingredients: 1
                }
            }
        ])

        return res.send({
            success: true, message: 'Pizzas fetched successfully',
            data: {
                data: pizzas,
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

// API to upsert pizza to update the isUsed status of ingredients on bake pizza
exports.upsert = async (req, res, next) => {
    try {
        let payload = req.body

        // type should be bake pizza
        const {userId, ingredientsIds, type} = payload
        console.log("type ============= ", type)
        if(type === "bakeAndMint"){
            const ingArrId = []
            Promise.all(
                ingredientsIds.map((e)=> {
                    ingArrId.push(ObjectId(e))
                })
            )

            console.log("ingArrIdingArrIdingArrId", ingArrId)
            await UserIngrdient.updateMany({ ingredientId : { $in: ingArrId }, userId: userId}, {$inc: { balance: -1 }}, {new : true})
            const pizza = await Pizza.findByIdAndUpdate({ _id: payload._id }, { _pizzaId: payload._pizzaId }, { new: true })
            // calculating the rarity of the pizza
            calculateRarity?.calculatePizzaRarity()
            return res.send({ success: true, message: 'Pizza updated successfully', pizza })
        }else {
            if(!ingredientsIds){
                return res.send({ success: false, message: 'ingredientsIds is required.'})
            }
            
            if(!userId){
                return res.send({ success: false, message: 'userId is required.'})
            }
            
            //this ingredientsIds is sent to decrement the balance from the userIngredient balance
            Promise.all(ingredientsIds.map(async(e)=> {
    
                // if this ingredient is already purchase buy the same user
                let alreadyExist = await UserIngrdient.findOne({userId:userId, ingredientId:e})
                console.log(alreadyExist)
                if(alreadyExist){
                    // will not do anything because, userIngredient document is alreasy persent and balance remains the balance
                }else {
                    await UserIngrdient.create({ 
                        userId:userId,
                        ingredientId:e,
                        balance:0
                     });        
                }
            }))

            // get current block number
            const blockNumber = await getCurrentBlockNumber()
            const pizza = await Pizza.findByIdAndUpdate({ _id: payload._id }, { _pizzaId: payload._pizzaId, blockNumber: blockNumber }, { new: true })
            
            // calculating the rarity of the pizza
            calculateRarity?.calculatePizzaRarity()
            return res.send({ success: true, message: 'Pizza updated successfully', pizza })
        }
    } catch (error) {
        return next(error)
    }
}

// Get Pizza Detail
exports.getPizza = async (req, res, next) => {
    try {
        let { _id } = req.query;
        let findPizza = await Pizza.findOne({ _id: _id });
        if (!findPizza) {
            return res.status(404).send({ status: false, message: "Pizza does not exist with this ID." });
        }
        let pizza = await Pizza.aggregate([
            {
                $match: {
                    _id: ObjectId(_id)
                },
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
                    _id: 1, name: 1, image: 1, creatorId: 1, createdAt: 1, contentIpfs: 1, _pizzaId: 1, ingredients: 1,  creatorAddress: '$creator.address'
                }
            }
        ])

        const totalPizza = await Pizza.countDocuments({_pizzaId: { $exists: true }})
        console.log(totalPizza)

        const ingredientsStats = []
        // calculating traits percentage
        let ingredients = await Ingredient.find({_ingredientId: {$exists: true}})
        Promise.all(ingredients.map(async (e)=> {
            let presentInPizzaCount = await Pizza.countDocuments({_pizzaId: { $exists: true }, ingredients : { $in : [e._id] }})
            ingredientsStats.push({ id: e._id, usedInPizza: presentInPizzaCount })
        }))


        let url = pizza[0].contentIpfs
        let pizzaAttributes = await getJSONData(url);
        
        let attributes = pizzaAttributes.attributes
        if(attributes) {
            let newAttributes = []
            for (let index = 0; index < ingredientsStats.length; index++) {
                const e = ingredientsStats[index];
                const ingredientObj = await Ingredient.findById(e.id)
                let percent = e.usedInPizza

                for (let index = 0; index < attributes.length; index++) {
                    const e = attributes[index];
                    if(e.trait_type === ingredientObj.name || e.value === ingredientObj.name ){
                        let percentValue = percent / totalPizza * 100
                        newAttributes.push({ trait_type: e.trait_type, value: e.value, percent: percentValue.toFixed(2) })
                    }
                }
            }
           
            pizzaAttributes["attributes"] = newAttributes

            res.send({
                success: true,
                message: 'Pizza Detail Fetched Successfully',
                data: { pizza, pizzaAttributes, newAttributes },
            })
        }else {
            res.send({
                success: false,
                message: 'Attributes not defined.',
            })
        }
    }
    catch (error) {
        return next(error.message)
    }
}

// API to make temp document for rebake pizza
exports.tempPizza = async (req, res, next) => {
    try {
        console.log("temp Pizza calling ")
        let payload = req.body
        const ingredientsIDsArr = []
        if (payload.ingredientIds) {
            const { ingredientIds, burnIngIds } = payload
            for (let i = 0; i < ingredientIds.length; i++) {
                const e = ingredientIds[i];
                ingredientsIDsArr.push(ObjectId(e))
            }
            payload["ingredients"] = ingredientsIDsArr
            
            const burnIngredients = []
            for (let index = 0; index < burnIngIds?.length; index++) {
                const e = burnIngIds[index];
                burnIngredients.push(ObjectId(e))
            }

            payload["burnIngredients"] = burnIngredients

            const ingredientsTraitsData = await Ingredient.aggregate([
                {
                    $match: {
                        _id: { $in: ingredientsIDsArr },
                        _ingredientId: { $exists: true }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        foreignField: '_id',
                        localField: 'categoryId',
                        as: 'ingredeintCatgegory',
                    },
                },
                {
                    $unwind: '$ingredeintCatgegory',
                },
                {
                    $project: {
                        type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1
                    }
                }
            ])

            let attributes = []

            let ingredientsArray = await Ingredient.aggregate(
                [
                    {
                        $match: {
                            _ingredientId: { $exists: true }
                        }
        
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            foreignField: '_id',
                            localField: 'categoryId',
                            as: 'ingredeintCatgegory',
                        },
                    },
                    {
                        $unwind: '$ingredeintCatgegory',
                    },
                    {
                        $project: {
                            type: '$ingredeintCatgegory.type', name: 1, _ingredientId: 1,
                        }
                    }
                ]
            )

            let baseInserted = false
            let sauceInserted = false
            let cheeseInserted = false
    
            Promise.all(ingredientsArray.map((e) => {
                if(e.type === "base"){
                    if(!baseInserted){
                        attributes.push({ 
                            trait_type: "Base",
                            value: "NONE"
                        })
                        baseInserted = true
                    }
                }else if (e.type === "sauce"){
                    if(!sauceInserted){
                        attributes.push({ 
                            trait_type: "Sauce",
                            value: "NONE"
                        })
                        sauceInserted = true
                    }
                }
                // else if(e.type === "cheese"){
                //     if(!cheeseInserted){
                //         attributes.push({ 
                //             trait_type: "Cheese",
                //             value: "NONE"
                //         })
                //         cheeseInserted = true
                //     }
                  
                // }
                 else {
                    attributes.push({ 
                        trait_type: e.name,
                        value: "NO"
                    })
                }
            }))

            Promise.all(ingredientsTraitsData.map((e) => {
                let type = e.type
                let mintedID = e._ingredientId
                if (e.type === "base") {
                    Promise.all(attributes.map((traits, index) => {
                        if(traits.trait_type === "Base"){
                            attributes[index].value = e.name
                            return
                        }
                    }))
                } else if (e.type === "sauce") {
                    Promise.all(attributes.map((traits, index) => {
                        if(traits.trait_type === "Sauce"){
                            attributes[index].value = e.name
                            return
                        }
                    }))
                }
                //  else if (e.type === "cheese") {
                //     Promise.all(attributes.map((traits, index) => {
                //         if(traits.trait_type === "Cheese"){
                //             attributes[index].value = e.name
                //             return
                //         }
                //     }))
                // }
                else {
                    Promise.all(attributes.map((traits, index) => {
                        let nameStr1 = e.name
                        let nameStr2 = traits.trait_type
                        if (nameStr1 === nameStr2) {
                            attributes[index].value = "YES"
                        }
                    }))
                }
            })
            )

            if (payload.image) {
                const data = payload.image.split(",")
                const img = Buffer.from(data[1], "base64");
                let imagePath = "pizza_image.png"
                let pizzaFile = fs.writeFileSync(imagePath, img)  
                let {ipfs, cloudinaryUrl} = await addImage("pizza_image.png")
                fs.unlinkSync("pizza_image.png")
                let contentIpfs = await addContent({
                    "name": "Pizza",
                    "description": "",
                    "image": ipfs,
                    attributes
                })
                payload.image = ipfs
                payload.contentIpfs = contentIpfs
                payload.imageCloudinaryUrl = cloudinaryUrl

            }
        }

        console.log("payload === ", payload)
        
        // get the minted id from pizza
        const pizza = await Pizza.findById(payload?.pizzaObjectId)
        payload._pizzaId = pizza._pizzaId

        // tempPizza Doc of that pizzaObjecID exists then remove it 
        await TempPizza.deleteMany({pizzaObjectId: payload?.pizzaObjectId})
        
        const tempPizza = await TempPizza.create(payload)
            
        return res.send({ success: true, message: 'Temp Pizza Created successfully', pizza: tempPizza })
    } catch (error) {
        return next(error)
    }
}

//get pizza attributes from contentIpfs
async function getJSONData(url) {
    return new Promise((resolve, reject) => {

        curl.get(url, {}, function (err, response, body) {
            if (err) {
                reject({});
            }
            else if (body) {
                body = JSON.parse(body);
                resolve(body);
            }
        });
    });
}