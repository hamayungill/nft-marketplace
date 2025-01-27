const mongoose = require('mongoose');

/**
 * TempPizza Schema
 * @private
 */

const TempPizzaSchema = new mongoose.Schema({
    pizzaObjectId: { type: String },
    image: { type: String },
    imageCloudinaryUrl: { type: String },
    ingredients: [{ _id: 0, type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    burnIngredients: [{ _id: 0, type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    contentIpfs: { type: String },
    _pizzaId: { type: Number }
}, { timestamps: true }
);

/**
 * @typedef TempPizza
 */

 module.exports = mongoose.model('TempPizza', TempPizzaSchema);

