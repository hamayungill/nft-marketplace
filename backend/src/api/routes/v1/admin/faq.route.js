const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/faq.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create').post(controller.create)
router.route('/edit').put(controller.edit)
router.route('/delete/:id').delete(controller.delete)
router.route('/get/:id').get(controller.get)
router.route('/list').post(controller.list)

module.exports = router