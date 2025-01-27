const mongoose = require('mongoose');

/**
 * NFT Schema
 * @private
 */
const NFTSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentPrice: { type: Number },
    txHash: { type: String },
    image: { type: String },
    royalty: { type: String },
    sold: { type: Number, default: 0 },
    sellingMethod: { type: Number }, // 1 = Fixed Price, 2 = Timed Auction
    sellingConfig: { type: Object },
    auctionStartDate: { type: Date },
    auctionEndDate: { type: Date },
    auctionStartTime: { type: String },
    auctionEndTime: { type: String },
    metaData: { type: String }, // ipfs link
}, { timestamps: true }
);

/**
 * @typedef NFT
 */

module.exports = mongoose.model('NFT', NFTSchema);