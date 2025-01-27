const express = require('express')
const router = express.Router()
const controller = require('../../../controllers/admin/admin.controller')
const { cpUpload } = require('../../../utils/upload')

router.route('/login').post(controller.login)
router.route('/create').post(cpUpload, controller.create)
router.route('/edit').put(cpUpload, controller.edit)
router.route('/delete/:adminId').delete(controller.delete)
router.route('/get/:adminId').get(controller.get)
router.route('/list').get(controller.list)
router.route('/edit-password').put(cpUpload, controller.editPassword)
router.route('/forgot-password').post(controller.forgotPassword)
router.route('/reset-password').put(cpUpload, controller.resetPassword)

module.exports = router