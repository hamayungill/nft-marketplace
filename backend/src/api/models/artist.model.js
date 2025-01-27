const mongoose = require('mongoose');

/**
 * Artist Schema
 * @private
 */

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true, maxLength: 50 },
    description: { type: String, required: true },
    learnMore: {type: String},
    image: { type: String },
    imageCloudinaryUri: { type: String}
}, { timestamps: true }
);

/**
 * @typedef Artist
 */

 module.exports = mongoose.model('Artist', artistSchema);

