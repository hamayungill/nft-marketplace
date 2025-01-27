const mongoose = require('mongoose');

/**
 * Category Schema
 * @private
 */
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, maxLength: 50 },
    description: { type: String },
    image: { type: String, required: true },
    imageCloudinaryUri: { type: String, },
    status: { type: Boolean, required: true, default: false },
    type: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    typeId: { type: Number, required: true}
}, { timestamps: true }
);

/**
 * @typedef Category
 */

module.exports = mongoose.model('Category', CategorySchema);