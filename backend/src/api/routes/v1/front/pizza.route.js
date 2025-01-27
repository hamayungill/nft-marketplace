const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/pizza.controller')

router.route('/create').post(controller.create)
router.route('/create-random').post(controller.createRandom)
router.route('/list').get(controller.list)
router.route('/listByUser').post(controller.pizzasByUser)
router.route('/delete/:pizzaId').delete(controller.delete)

// edit while rebake
router.route('/edit').put(controller.edit)
router.route('/upsert').put(controller.upsert)
router.route('/ingredients/:pizzaId').get(controller.getIngredients)
// temp
router.route('/create/tempPizza').post(controller.tempPizza)
router.route('/').get(controller.getPizza)


module.exports = router