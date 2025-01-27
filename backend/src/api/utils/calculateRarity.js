const Ingredient = require("../models/Ingredients.model")
const Pizza = require("../models/pizza.model")
const web3Fn = require("./web3")

const getIngredientRarity = async(_ingredientId) => {
    const res = await web3Fn.getIngredientsData(_ingredientId)
    return res
}

exports.calculatePizzaRarity = async () => { 
    // get rarity of all the ingredients
    let ingredientQuery = [
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
                Ing_id: 1, _ingredientId: 1, catType: '$ingredeintCatgegory.type' 
            }
        }
    ]
    const ingredientList = await Ingredient.aggregate(ingredientQuery)
    const rarityData = []
    for (let index = 0; index < ingredientList.length; index++) {
        const e = ingredientList[index];
        const res = await getIngredientRarity(e._ingredientId)
        let { name, rarity, usedIn } = res
        rarity = await web3Fn.weitoEth(rarity)
        let a = parseFloat(rarity)?.toFixed(2)
        rarityData.push({name, rarity: parseFloat(rarity), usedIn: parseInt(usedIn), _id: e._ingredientId, type: e.catType})   
    }

    // arrays for every type of ingredient
    let baseRarityArr = []
    let sauceRarityArr = []
    let cheeseRarityArr = []
    let meatRarityArr = []
    let toppingRarityArr = []

    Promise.all(rarityData?.map((e)=> {
        if(e.type === "base"){
            baseRarityArr.push(e)
        }else if(e.type === "sauce"){
            sauceRarityArr.push(e)
        }else if(e.type === "cheese"){
            cheeseRarityArr.push(e)
        }else if(e.type === "meat"){
            meatRarityArr.push(e)
        }else if(e.type === "topping"){
            toppingRarityArr.push(e)
        }else {}
    }))

    // find the list of all the pizza, need to calculate rarity 
    // _pizzaId, ingredientsId = [arrays_of_ingredientId]
    let query = [
        {
            $match: {
                _pizzaId: { $exists: true }
            },
        },
        { 
            $lookup: {
              from: "ingrdients",
              let: { "ingredients": "$ingredients" },
              pipeline: [
                { $match: { $expr: { $in: [ "$_id", "$$ingredients" ] } } }
              ],
              as: "ingObj"
            }
        },
        {
            $project: {
                _id: 1, _pizzaId: 1, ingredients: "$ingObj._ingredientId"
            }
        }
    ]

    const pizzaList = await Pizza.aggregate(query)

    Promise.all(pizzaList.map(async (p)=> {
        let accumulatedRarity = 0
        let saucePresent = false
        let cheesePresent = false
        let meatExists = []
        let toppingExists = []
        Promise.all(p?.ingredients?.map((id)=> {
                Promise.all(rarityData.map((r)=> {
                    if(id === r._id){
                        if(r.type === "base"){
                            accumulatedRarity+=r.rarity
                        }else if(r.type === "sauce"){
                            saucePresent = true
                            accumulatedRarity+=r.rarity
                        }else if(r.type === "cheese"){
                            cheesePresent = true
                            accumulatedRarity+=r.rarity
                        }else if(r.type === "meat"){
                            meatExists.push(id)
                        }else if(r.type === "topping"){
                            toppingExists.push(id)
                        }
                    }
                }))        
            }))

            if(!saucePresent){
                // add no sauce rarity in accumulated rarity
                let totalSauceRarity = 0
                Promise.all(sauceRarityArr.map((e)=> {
                    totalSauceRarity+=e.rarity
                }))
                let noSauceRarity  = 100 - totalSauceRarity
                accumulatedRarity+=noSauceRarity
            }

            if(!cheesePresent){
                // add no cheese rarity in accumulated rarity
                let totalCheeseRarity = 0
                Promise.all(cheeseRarityArr.map((e)=> {
                    totalCheeseRarity+=e.rarity
                }))
                let noCheeseRarity  = 100 - totalCheeseRarity
                accumulatedRarity+=noCheeseRarity
            }

            // add meat rarity
            Promise.all(meatRarityArr.map((e)=> {
                if(meatExists.includes(e._id)){
                    accumulatedRarity+=e.rarity
                }else {
                    let noMeatRarity  = 100 - e.rarity 
                    accumulatedRarity+=noMeatRarity
                } 
            }))

            // add topping rarity 
            Promise.all(toppingRarityArr.map((e)=> {
                if(toppingExists.includes(e._id)){
                    accumulatedRarity+=e.rarity
                }else {
                    let noToppingRarity  = 100 - e.rarity 
                    accumulatedRarity+=noToppingRarity
                } 
            }))
            // update the pizza docs with its rarity
            await Pizza.findOneAndUpdate({_pizzaId: p?._pizzaId}, {rarity: accumulatedRarity/rarityData?.length})
        }))
}