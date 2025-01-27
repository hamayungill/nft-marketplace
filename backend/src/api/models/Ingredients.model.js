const mongoose = require('mongoose');

/**
 * Ingrdients Schema
 * @private
 */
const IngrdientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    isActive:{ type:Boolean, default:true},
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    pizzaImage: { type: String },
    image: { type: String },
    imageCloudinaryUrl: { type: String},
    pizzaImageCloudinaryUrl: {type: String},
    price: { type: Number, default:"0.01"},
    rarity: { type: Number, default: 100},
    artistAddress: { type: String, required: true },
    maxMints: { type: Number, required: true },
    alreadyMinted: {type: Number, default: 0},

    // smart contract - mintedId for ingredient 
    _ingredientId: { type: Number },
    layerNum: {type: Number, default: 0}

}, { timestamps: true }
);

/**
 * @typedef Ingrdient
 */

IngrdientSchema.index( { name: "text" } )
module.exports = mongoose.model('Ingrdient', IngrdientSchema);

