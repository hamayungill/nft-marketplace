const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/faq.controller')

router.route('/list').get(controller.list)

module.exports = router