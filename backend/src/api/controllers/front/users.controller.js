const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId
const UserModal = require('../../models/users.model');
const { addImage } = require('../../utils/upload');
const UserIngrdient = require('../../models/userIngredients.model')
const Pizza = require('../../models/pizza.model')

exports.create = async (req, res, next) => {
  try {
    let user = await UserModal.create(req.body);
    
    return res.send({status: true, data: user});
  } catch (error) {
    return next(error);
  }
};
exports.update = async (req, res, next) => {
  try {
    let payload = req.body;
    const _id = req.user;
    if(!payload.username) {
      return res.send({status: false, message: "Please fill all required fields"});
    }
    // if(req.file) {
    //   const imgData = fs.readFileSync(req.file.path)
    //   payload.profileImage = await addImage(imgData);
    // }
    if (req.files) {
      for (const key in req.files) {
        const image = req.files[key][0]
        const imgData = fs.readFileSync(image.path)
        payload[key] = await addImage(imgData)
      }
    }
        
    let user = await UserModal.findByIdAndUpdate({_id}, {$set : payload}, {new: true});
    let data = user.transform();
    return res.send({status: true, data, message: "Your profile is updated successfully."});
  } catch (error) {
    return next(error);
  }
};
exports.getCreators = async (req, res, next) => {
  try {
    let users = await UserModal.aggregate([
      {
        $match: {}
      },
      {
        $project: {
          profileImage: 1,
          username: 1,
          address: 1
        }
      }
    ]);
    return res.send({status: true, data: users, message: "Authors fetched succesfully"});
  } catch (error) {
    return next(error);
  }
};
exports.topSellers = async (req, res, next) => {
  try {
    let users = await UserModal.aggregate([
      {
        $match: {}
      },
      {
        $project: {
          profileImage: 1,
          username: 1,
          address: 1
        }
      }
    ]);
    return res.send({status: true, data: users, message: "Top Sellers fetched succesfully"});
  } catch (error) {
    return next(error);
  }
};
exports.getUser = async (req, res, next) => {
  try {
    let {userId} = req.params;
    
    let user = await UserModal.findOne({_id: ObjectId(userId)});
    user = user.transform();
    return res.send({status: true, data: user, message: "Top Sellers fetched succesfully"});
  } catch (error) {
    return next(error);
  }
};

exports.myWallet = async (req, res, next) => {
    try {
        const { userId } = req.params
        const { type } = req.body

        if(type === "ingredient"){

            // dbQuery for user ingredient
            let dbQueryIng=[
              {
                $match: {
                    userId: ObjectId(userId),
                    balance: { $gt: 0 }
                  },
              },
              {
                $lookup: {
                  from: 'ingrdients',
                  foreignField: '_id',
                  localField: 'ingredientId',
                  as: 'ingredientObj',
                }
              },
              {
                $unwind: '$ingredientObj',
              },
              {
                $lookup: {
                  from: "categories",
                  foreignField: '_id',
                  localField: 'ingredientObj.categoryId',
                  as: 'categoryObj',
                }               
              },
              {
                $unwind: '$categoryObj',
              },
              {
                $project: {
                    _id: 0,
                    id: "$ingredientObj._id",
                    _id: "$ingredientObj._id",
                    imageCloudinaryUrl: "$ingredientObj.imageCloudinaryUrl",
                    pizzaImageCloudinaryUrl: "$ingredientObj.pizzaImageCloudinaryUrl",
                    name: "$ingredientObj.name",
                    price: "$ingredientObj.price",
                    uId: "$_id",
                    _ingredientId : "$ingredientObj._ingredientId",
                    balance: "$balance",
                    catTypeId: "$categoryObj.typeId",
                    // catMax : "$categoryObj.max",
                    // catMin: "$categoryObj.min",
                    catName: "$categoryObj.name",
                    catType: "$categoryObj.type", 
                    layerNum: "$ingredientObj.layerNum",
                }
              },
              { $sort: { layerNum: 1 } },
            ]

            let userIngredients = await UserIngrdient.aggregate(dbQueryIng);  

            return res.send({
                success: true, message: 'User Ingredients fetched successfully',
                data: { userIngredients }
            })
        }
       
        if(type === "pizza"){
          let pizzas = await Pizza.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: {currentOwnerId : ObjectId(userId), _pizzaId: { $exists: true} }},
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
                    _id: 1, name: 1, image: 1, imageCloudinaryUrl: 1, price: 1, type: "pizza", isActive: 1, rarity: 1, currentOwnerId: 1, creatorId: 1, createdAt: 1, currentOwnerName: '$currentOwner.username', creatorName: '$creator.username', ingredients: 1, _pizzaId: 1, ingArray: '$ingObj' }
            }
          ])      
          return res.send({
            success: true, message: 'User Pizzas fetched successfully',
            data: { pizzas }
          })
        }else {
          return res.send({
            success: true, message: 'Something going wrong.',
            data: null
          })
        }
    } catch (error) {
        return next(error)
    }
}
