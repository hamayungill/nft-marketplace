const mongoose = require('mongoose');

/**
 * Pizza Schema
 * @private
 */

const PizzaSchema = new mongoose.Schema({
    name: { type: String, maxLength: 50},
    image: { type: String },
    imageCloudinaryUrl: { type: String},
    isActive: { type:Boolean, default:true },
    rarity: { type: Number, required: true },
    ingredients: [{ _id: 0, type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    currentOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rewardSent: { type: Boolean, default: false},
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentIpfs: {type: String},
    type: { type: String, default: "normal" }, //random, normal
    _pizzaId: { type: Number },
    blockNumber: {type: String, default: 0}
}, { timestamps: true }
);

/**
 * @typedef Pizza
 */

 module.exports = mongoose.model('Pizza', PizzaSchema);

