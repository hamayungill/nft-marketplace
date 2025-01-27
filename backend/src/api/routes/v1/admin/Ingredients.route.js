const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/ingredient.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create').post(cpUpload,controller.create)
router.route('/edit').put(cpUpload, controller.edit)
router.route('/delete/:ingredientId').delete(controller.delete)
router.route('/get/:ingredientId').get(controller.get)
router.route('/list').post(controller.list)
router.route('/stats').get(controller.stats)
router.route('/createIng').post(controller.createIng) //edit

module.exports = router