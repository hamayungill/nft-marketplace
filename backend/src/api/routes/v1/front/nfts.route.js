const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/front/nfts.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/create').post(cpUpload, controller.create)
router.route('/edit').put(cpUpload, controller.edit)
router.route('/get/:nftId').get(controller.get)
router.route('/list').get(controller.list)

module.exports = router