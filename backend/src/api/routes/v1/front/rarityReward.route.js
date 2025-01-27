const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/rarityReward.controller')

router.route('/list').get(controller.list)
router.route('/send').post(controller.sendReward)

module.exports = router