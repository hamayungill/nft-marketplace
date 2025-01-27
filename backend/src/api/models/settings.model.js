const mongoose = require('mongoose');

/**
 * Settings Schema
 * @private
 */
const SettingsSchema = new mongoose.Schema({
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    discord: { type: String, default: '' },
    twitter: { type: String, default: '' },
    openSea: { type: String, default: '' },
    lookSrare: { type: String, default: '' },
    youtube: { type: String, default: '' },
    royality: { type: String, default: '' },
    share: { type: String, default: '' },
    desc: { type: String, default: '' },
    domain: { type: String, default: '' },
    api: { type: String, default: '' },
    whitelistUserStartTime: {type: String, default: ''},
    whitelistUserEndTime: {type: String, default: ''},

}, { timestamps: true }
);

/**
 * @typedef Settings
 */

module.exports = mongoose.model('Settings', SettingsSchema);