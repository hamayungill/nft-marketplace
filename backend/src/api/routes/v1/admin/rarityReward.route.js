const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/rarityReward.controller.js')

router.route('/send').post(controller.sendReward)

module.exports = router