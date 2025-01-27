const fs = require('fs')
const Artist = require('../../models/artist.model')
const { checkDuplicate } = require('../../../config/errors')
const { addImage } = require('../../utils/upload')

// API to create Artist
exports.create = async (req, res, next) => {
    try {
        let payload = req.body

        if (req.files && req.files.image) {
            const image = req.files.image[0]
            const {ipfs, cloudinaryUrl} = await addImage(image.path)
            payload.image = ipfs
            payload.imageCloudinaryUri = cloudinaryUrl
        }

        const artist = await Artist.create(payload)
        return res.send({ success: true, message: 'Artist created successfully', artist })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'artist')
        else
            return next(error)
    }
}

// API to edit Artist
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        if(req.files && req.files.image) {
            const image = req.files.image[0]
            const {ipfs, cloudinaryUrl} = await addImage(image.path)
            payload.image = ipfs
            payload.imageCloudinaryUri = cloudinaryUrl
        }
        const artists = await Artist.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Artist updated successfully', artists })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'artists')
        else
            return next(error)
    }
}

// API to delete Artist
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const artist = await Artist.deleteOne({ _id: id })
            if (artist && artist.deletedCount)
                return res.send({ success: true, message: 'Artist deleted successfully', id })
            else return res.status(400).send({ success: false, message: 'Artist not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Artist Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Artist
exports.get = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const artist = await Artist.findOne({ _id: id }, { name: 1, description: 1, image: 1, learnMore: 1, createdAt:1 }).lean(true)
            if (artist)
                return res.json({ success: true, message: 'Artist retrieved successfully', data: artist })
            else return res.status(400).send({ success: false, message: 'Artist not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Artist Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Artist list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query

        // fields for searching
        let { name } = req.body
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        let countDocument={}
        let dbQuery=[
                { $sort: { createdAt: -1 } },
                { $skip: limit * (page - 1) },
                { $limit: limit },
                {
                    $project: {
                        _id: 1, name: 1, description: 1, imageCloudinaryUri: 1, learnMore: 1, createdAt: 1
                    }
                }
            ]
            
        if(name){
         countDocument={ name: { $regex: new RegExp(name), $options: "si" }, }
          var searchTerm= {
              $match: { name: { $regex: new RegExp(name), $options: "si" }, },
            }
            dbQuery.unshift(searchTerm)
        }

        const total = await Artist.countDocuments(countDocument)
        const artists = await Artist.aggregate(dbQuery)
        
        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        return res.send({
            success: true, message: 'Artist fetched successfully',
            data: {
                data: artists,
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
