const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const Settings = require('../../models/settings.model')
const { addImage } = require('../../utils/upload')
const { checkDuplicate } = require('../../../config/errors')


// API to edit Settings
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const findSettings = await Settings.findOne()
        if (findSettings) {
            const settings = await Settings.findByIdAndUpdate({ _id: findSettings._id }, { $set: payload }, { new: true })
            return res.send({ success: true, message: 'Settings updated successfully', settings })
        }
        else {
            const settingsObj = new Settings(payload)
            const settings = await settingsObj.save()
            return res.send({ success: true, message: 'Settings updated successfully', settings })
        }

    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Settings')
        else
            return next(error)
    }
}

// // API to get Settings
exports.get = async (req, res, next) => {
    try {
        const settings = await Settings.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 }).lean(true)
        if (settings)
            return res.json({ success: true, message: 'Settings retrieved successfully', settings })
        else
            return res.json({ success: false, message: settings })
    } catch (error) {
        return next(error)
    }
}
