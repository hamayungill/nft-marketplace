const fs = require('fs')
const moment = require('moment')
const User = require('../../models/users.model')
const NFT = require('../../models/nfts.model')
const { addImage, addContent } = require('../../utils/upload')
const ObjectId = require('mongoose').Types.ObjectId
const { userDefaultImage, collectionDefaultImage } = require('../../../config/vars')

// API to create NFT
exports.create = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            const imgData = fs.readFileSync(image.path)
            payload.image = await addImage(imgData)
        }

        payload.metaData = await addContent({
            name: payload.name,
            description: payload.description,
            image: payload.image,
            properties: {
                size: payload.size || '',
            },
        })

        payload.ownerId = req.user
        payload.creatorId = req.user

        const nft = await NFT.create(payload)
        return res.send({ success: true, message: 'Item created successfully', nft })
    } catch (error) {
        return next(error)
    }
}

// API to edit NFT
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if (req.files && req.files.image) {
            const image = req.files.image[0]
            const imgData = fs.readFileSync(image.path)
            payload.image = await addImage(imgData)
        }

        // set NFT selling config. 
        if (payload.sellingMethod && payload.sellingConfig) {
            payload.sellingConfig = JSON.parse(payload.sellingConfig)

            // set auction start & end date-time
            const datetimeKey = Number(payload.sellingMethod) === 1 ? 'listingSchedule' : 'duration'
            payload.auctionStartDate = payload.sellingConfig[datetimeKey]?.startDate
            payload.auctionEndDate = payload.sellingConfig[datetimeKey]?.endDate
            payload.auctionStartTime = payload.sellingConfig[datetimeKey]?.startTime
            payload.auctionEndTime = payload.sellingConfig[datetimeKey]?.endTime
        }

        const nft = await NFT.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'NFT updated successfully', nft })
    } catch (error) {
        return next(error)
    }
}

// API to get a NFT
exports.get = async (req, res, next) => {
    try {
        const { nftId } = req.params
        const nft = await NFT.aggregate([
            {
                $match: { _id: ObjectId(nftId) }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'creatorId',
                    as: 'creator'
                }
            },
            {
                $unwind: '$creator'
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'ownerId',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $lookup: {
                    from: 'collections',
                    foreignField: '_id',
                    localField: 'collectionId',
                    as: 'collection'
                }
            },
            {
                $unwind: '$collection'
            },
            {
                $lookup: {
                    from: 'bids',
                    foreignField: 'nftId',
                    localField: '_id',
                    as: 'bids'
                }
            },
            {
                $lookup: {
                    from: 'auctions',
                    foreignField: '_id',
                    localField: 'nftId',
                    as: 'auctions'
                }
            },
            {
                $project: {
                    _id: 1, name: 1, description: 1, image: 1, createdAt: 1, sellingMethod: 1,
                    size: { $ifNull: ['$size', 'N/A'] },
                    sold: 1, copies: 1, currentPrice: 1,
                    auctionEndDate: 1,
                    creator: {
                        _id: '$creator._id',
                        username: '$creator.username',
                        profilePhoto: { $ifNull: ['$creator.profilePhoto', userDefaultImage] }
                    },
                    owner: {
                        _id: '$owner._id',
                        username: '$owner.username',
                        profilePhoto: { $ifNull: ['$owner.profilePhoto', userDefaultImage] }
                    },
                    collection: {
                        _id: '$collection._id',
                        name: '$collection.name',
                        image: { $ifNull: ['$collection.image', collectionDefaultImage] }
                    },
                    bids: '$bids',
                    highestBidAmt: { $max: '$bids.bidAmount' }
                },
            }
        ])

        return res.send({ success: true, message: 'Item retrieved successfully', nft: nft.length ? nft[0] : null })
    } catch (error) {
        return next(error)
    }
}

// API to get NFTs list
exports.list = async (req, res, next) => {
    try {
        let { page, limit, collectionId, explore } = req.query
        let filter = {}

        // explore exclusive assets
        if (explore) {
            filter = {
                $or: [
                    { sellingMethod: 1 },
                    { sellingMethod: 2 }
                ],
                auctionStartDate: { $lt: new Date(moment().add(1, 'days').format('YYYY/MM/DD')) },
                auctionEndDate: { $gte: new Date(moment().format('YYYY/MM/DD')) }
            }
        }

        if (collectionId)
            filter.collectionId = ObjectId(collectionId)

        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        const total = await NFT.countDocuments(filter)

        const nfts = await NFT.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'ownerId',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $project: {
                    name: 1, image: 1, sold: 1, copies: 1, currentPrice: 1,
                    owner: {
                        _id: '$owner._id',
                        username: '$owner.username',
                        profilePhoto: { $ifNull: ['$owner.profilePhoto', userDefaultImage] }
                    }
                }
            }
        ])

        return res.send({
            success: true, message: 'NFTs fetched successfully',
            data: {
                nfts,
                pagination: {
                    page, limit, total,
                    pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit)
                }
            }
        })
    } catch (error) {
        return next(error)
    }
}