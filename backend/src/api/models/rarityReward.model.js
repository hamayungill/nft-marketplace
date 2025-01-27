const mongoose = require('mongoose');

/**
 * RarityReward Schema
 * @private
 */

const RarityRewardSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    pizzaId : { type: mongoose.Schema.Types.ObjectId, ref: "Pizza", required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }
);

/**
 * @typedef RarityReward
 */

 module.exports = mongoose.model('RarityReward', RarityRewardSchema);
