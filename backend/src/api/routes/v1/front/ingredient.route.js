const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/ingredient.contoller')

router.route('/list').get(controller.list)
router.route('/list-by-category/').get(controller.listByCategory)
router.route('/buy-ingredient').post(controller.buyIngredient)
router.route('/buy-multiple-ingredients').post(controller.buyMultipleIngredient)

router.route('/user-ingredients/:userId').post(controller.ingredientsByUser)

// to edit the userIngridient document
router.route('/user-ingredients/edit').put(controller.editUserIngredient)

// ingredients random pizza
router.route('/ingredients-random-pizza').get(controller.ingredientsForRandomPizza)

router.route('/useringredients-random-pizza').post(controller.multipleIngredients)


module.exports = router