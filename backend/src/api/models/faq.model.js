const mongoose = require('mongoose');

 
const FaqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String },
}, { timestamps: true }
);

module.exports = mongoose.model('Faqs', FaqSchema);