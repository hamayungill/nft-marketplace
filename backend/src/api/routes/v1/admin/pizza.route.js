const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/pizza.controller')

router.route('/list').post(controller.list)
router.route('/stats').get(controller.stats)

module.exports = router