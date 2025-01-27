const UserIngrdient = require('../../models/userIngredients.model')
const Ingredient=require('../../models/Ingredients.model')
const ObjectId = require('mongoose').Types.ObjectId
const Pizza = require('../../models/pizza.model')

// API to get active Ingredient list
exports.list = async (req, res, next) => {
    try {

        // all the ingredient
        // dbQuery for match
        let dbQuery=[
            {
                $match: {
                    _ingredientId: { $exists: true}
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
            { $group: { 
                _id : '$_id',
                _ingredientId: { $first:'$_ingredientId'},
                imageCloudinaryUrl: {$first: '$imageCloudinaryUrl'}, 
                pizzaImageCloudinaryUrl: {$first: '$pizzaImageCloudinaryUrl'},
                name: {$first: '$name'}, 
                price: {$first: '$price'}, 
                catType: {$first: '$ingredeintCatgegory.type'}, 
                // catName: {$first: '$ingredeintCatgegory.name'}, 
                // // catMin: {$first: '$ingredeintCatgegory.min'}, 
                // // catMax: {$first: '$ingredeintCatgegory.max'},
                layerNum: {$first: '$layerNum'}
            }},
            { $sort: { layerNum: 1 } },
        ]
                
        const ingredients = await Ingredient.aggregate(dbQuery);
        return res.send({ success: true, message: 'ingredient fetched successfully', ingredients })
    } catch (error) {
        return next(error)
    }
}

exports.listByCategory = async (req, res, next) => {
    try {
        let { page, limit,categoryId, name :searchQuery, sort } = req.query
       
        if(sort === "ascending"){
            sort = -1
        }else {
            sort = 1
        }

        // fetch all the ingredients for rariry chart from frontend
        if(page === "1" && limit === "0"){ 
            limit = await Ingredient.countDocuments()
        }else {
            page = page !== undefined && page !== '' ? parseInt(page) : 1
            limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10
        }

        let total = 1;
        let query=[
            {
                $match: {
                    _ingredientId: { $exists: true}
                }
            },
            { $sort: { categoryId: 1 } },
            // { $skip: limit * (page - 1) },
            // { $limit: limit },
            {
                $project: {
                    _id: 1, name: 1, image: 1, isActive: 1, createdAt: 1, price: 1, rarity: 1, _ingredientId: 1, maxMints: 1, alreadyMinted:1
                }
            }
        ]
        let condition;
        if(categoryId){
            if(searchQuery){
                condition= {$match: {
                    $text: { $search: searchQuery},
                    isActive:true,
                    categoryId:ObjectId(categoryId)
                }}
                total= await Ingredient.countDocuments({isActive:true, categoryId, $text: { $search: searchQuery}, _ingredientId: { $exists: true}})

            }else{
                condition= {$match: {
                    isActive:true,
                    categoryId:ObjectId(categoryId)
                }}
                total= await Ingredient.countDocuments({isActive:true,categoryId})

            }
             
        }else{
            if(searchQuery){
                condition= {$match: {
                    $text: { $search: searchQuery},
                    isActive:true,
                }}
                total= await Ingredient.countDocuments({isActive:true, $text: { $search: searchQuery}})

            }else{
                condition= {$match: {
                isActive:true,
            }}
            total= await Ingredient.countDocuments({isActive:true})
        }
        }

        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

         
            query.unshift(condition)

        const ingredient = await Ingredient.aggregate(query);

        return res.send({
            success: true, message: 'Ingredients fetched successfully',
            data: {
                ingredients:ingredient,
                pagination: {
                    page, limit, total: 1,
                    // pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}

exports.buyIngredient = async (req, res, next) => {
    try {
        const { userId, ingredientId } = req.body
        const ingredient = await UserIngrdient.create({ ...req.body });        
        
        // update the ownedby of ingredient 
        await Ingredient.findByIdAndUpdate(ingredientId, {ownedBy : userId})
        
        return res.send({ success: true, message: 'ingredient fetched successfully', ingredient })
    } catch (error) {
        return next(error)
    }
}

exports.ingredientsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params

        // dbQuery for match
        let dbQuery=[
            {
                $match: {
                    userId: ObjectId(userId),
                    isUsed: false,
                    _userIngredientId: { $exists: true}
                },
            },
            {
                $lookup: {
                    from: 'ingrdients',
                    foreignField: '_id',
                    localField: 'ingredientId',
                    as: 'ingredientObj'
                }
            },
            {
                $unwind: '$ingredientObj',
            },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'ingredientObj.categoryId',
                    as: 'ingredeintCatgegory',
                },
            },
            {
                $unwind: '$ingredeintCatgegory',
            },
            { $sort: { createdAt: -1 } },
            { $group: { 
                _id : '$ingredientObj._id',
                isUsed: { $first: "$isUsed"},
                Ing_id: { $first:'$ingredientObj._id'},
                _userIngredientId: {$first: '$_userIngredientId'},  
                image: {$first: '$ingredientObj.image'},
                pizzaImage: {$first: '$ingredientObj.pizzaImage'}, 
                name: {$first: '$ingredientObj.name'}, 
                price: {$first: '$ingredientObj.price'}, 
                catType: {$first: '$ingredeintCatgegory.type'}, 
                catName: {$first: '$ingredeintCatgegory.name'}, 
                catMin: {$first: '$ingredeintCatgegory.min'}, 
                catMax: {$first: '$ingredeintCatgegory.max'},
                UId: { $first: '$_id'}
            }},
            
            // {
            //     $project : {
            //         _id: 1, isUsed: 1, Ing_id: '$ingredientObj._id', _userIngredientId: 1,  image: '$ingredientObj.image', name: '$ingredientObj.name', price: '$ingredientObj.price', catType: '$ingredeintCatgegory.type', catName: '$ingredeintCatgegory.name', catMin: '$ingredeintCatgegory.min', catMax: '$ingredeintCatgegory.max', 
            //     }
            // }
        ]
        
        
        const ingredients = await UserIngrdient.aggregate(dbQuery);
        
        return res.send({
            success: true, message: 'Ingredients fetched successfully',
            data: {
                ingredients,
            }
        })
    } catch (error) {
        return next(error)
    }
}

exports.ingredientsForRandomPizza = async (req, res, next) => {
  
    try {
        let dbQuery=[
            {
                $match: {
                    _ingredientId: { $exists: true}
                },
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
                $project : {
                    Ing_id: 1, _ingredientId: 1 ,  image: 1, pizzaImage: 1, pizzaImageCloudinaryUrl: 1, name: 1, price: 1, catType: '$ingredeintCatgegory.type', catName: '$ingredeintCatgegory.name', catMin: '$ingredeintCatgegory.min', catMax: '$ingredeintCatgegory.max', 
                }
            }
        ]

        const ingredients = await Ingredient.aggregate(dbQuery)

        let base = []
        let sauce = []
        let cheese = []
        let meat = []
        let topping = []

        Promise.all(ingredients.map((e)=> {
            if(e.catType === "base"){
                base.push(e)
            }else if(e.catType === "sauce"){
                sauce.push(e)
            }else if(e.catType === "cheese"){
                cheese.push(e)
            }else if(e.catType === "meat"){
                meat.push(e)
            }else if(e.catType === "topping"){
                topping.push(e)
            }else{}        
        }))
        
        let data = {
            base: base[Math.floor(Math.random()*base.length)], 
            sauce: sauce[Math.floor(Math.random()*sauce.length)],
        }

        // for cheese
        let cheeseArr = []
        let numCheese = 0
        numCheese = Math.floor(Math.random() * cheese?.length) + 1
        cheese = shuffle(cheese)
        for (let i = 0; i < numCheese ; i++) {
            cheeseArr.push(cheese[i]);
        }
        data["cheese"] =  cheeseArr

        // for meat
        if(Math.floor(Math.random() * 2) > 0){
            let meatArr = []
            let numMeat = 0

            if(meat.length >=4){
                numMeat = Math.floor(Math.random() * 4) + 1  //number of meat you want to put, but less than 8
            }else {
                numMeat = Math.floor(Math.random() * meat?.length) + 1
            }
            meat = shuffle(meat)
            for (let i = 0; i < numMeat ; i++) {
                meatArr.push(meat[i]);
            }
            data["meat"] =  meatArr
        }

        if(Math.floor(Math.random() * 2) > 0){
            let toppingArr = []
            let numTop = 0

            if(topping.length >=4){
                numTop = Math.floor(Math.random() * 4) + 1  //number of topping you want to put, but less than 8
            }else {
                numTop = Math.floor(Math.random() * topping?.length) + 1
            }
            topping = shuffle(topping)
            for (let i = 0; i < numTop; i++) {
                toppingArr.push(topping[i]);
            }
            data["topping"] =  toppingArr
        }

        return res.send({
            success: true, message: 'Random fetched successfully',
            data,
        })
    } catch (error) {
        return next(error)
    }
}

// API to edit user buyed ingredient
exports.editUserIngredient = async (req, res, next) => {
    try {
        let payload = req.body
        const userIngredient = await UserIngrdient.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        const ingredient = await Ingredient.findById({ _id: userIngredient?.ingredientId})
        let count = ingredient.alreadyMinted
        count++;
        await Ingredient.findByIdAndUpdate({ _id: userIngredient?.ingredientId}, {alreadyMinted : count})
        return res.send({ success: true, message: 'User Ingredient updated successfully', userIngredient })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Category')
        else
            return next(error)
    }
}

// add user ingredients when random pizza is minted
exports.multipleIngredients = async (req, res, next) => {
    try {
        const { ingredientsList , userId, pizzaNFTId} = req.body
        console.log("req.bodyreq.bodyreq.bodyreq.bodyreq.bodyreq.body",req.body)
        let userIngredientsArray = []

        for (let index = 0; index < ingredientsList.length; index++) {
            const e = ingredientsList[index];
            if(e.ingId){
                let ingObj = await Ingredient.findOne({ _ingredientId: e.ingId})
                const uId = await UserIngrdient.create({
                    isUsed:true,
                    userId:userId,
                    ingredientId:ingObj._id,
                    _userIngredientId:e.ingUId
                })
                console.log("uIduIduIduIduIduIduId",uId)
                
                userIngredientsArray.push(uId._id)
            }
        }

        // Promise.all(ingredientsList.map((e)=> {
        //     if(e.ingId){
        //         let ingObj = Ingredient.findOne({ _ingredientId: e.ingId})
        //         const uId = UserIngrdient.create({
        //             isUsed:true,
        //             userId:userId,
        //             ingredientId:ingObj._id,
        //             _userIngredientId:e.ingUId
        //         })
        //         console.log("uIduIduIduIduIduIduId",uId)
                
        //         userIngredientsArray.push(uId._id)
        //     }
        // }))
        
        console.log("userIngredientsArrayuserIngredientsArrayuserIngredientsArray",userIngredientsArray)
        // get User Ingredients 
        const pizza  = await Pizza.findOneAndUpdate({_pizzaId: pizzaNFTId}, {userIngredients: userIngredientsArray})

        return res.send({ success: true, message: 'Pizza updated successfully', pizza })
    } catch (error) {
        return next(error)        
    }
}


// buy multiple ingredients
exports.buyMultipleIngredient = async (req, res, next) => {
    try {
        const { userId, ingredients } = req.body

        Promise.all(ingredients.map(async(e)=> {

            // if this ingredient is already purchase buy the same user
            let alreadyExist = await UserIngrdient.findOne({userId:userId, ingredientId:e._id})
            console.log(alreadyExist)
            if(alreadyExist){
                // update the balance
                let balance = alreadyExist.balance + parseInt(e.balance)
                console.log("balance already = ", balance)
                await UserIngrdient.findByIdAndUpdate({_id: alreadyExist._id}, {balance : balance})
            }else {
                await UserIngrdient.create({ 
                    userId:userId,
                    ingredientId:e._id,
                    balance:e.balance
                 });        
            }
        }))

        return res.send({ success: true, message: 'Multiple Ingredients Purchased successfully' })
    } catch (error) {
        return next(error)
    }
}


function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }