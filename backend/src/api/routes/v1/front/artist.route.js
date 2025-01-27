const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/artist.controller')

router.route('/list').post(controller.list)

module.exports = router