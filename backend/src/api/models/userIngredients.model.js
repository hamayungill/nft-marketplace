const mongoose = require('mongoose');

/**
 * Ingrdients Schema
 * @private
 */
const UserIngrdientSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrdient' },
    balance : {type : Number} ,
}, { timestamps: true }
);

/**
 * @typedef Ingrdient
 */

module.exports = mongoose.model('UserIngrdient', UserIngrdientSchema);