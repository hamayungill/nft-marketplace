const Faqs = require('../../models/faq.model')
const { checkDuplicate } = require('../../../config/errors')

// API to create Faq
exports.create = async (req, res, next) => {
    try {
        const faq = await Faqs.create({...req.body})
        return res.send({ success: true, message: 'Faq created successfully', faq })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'faq')
        else
            return next(error)
    }
}

// API to edit Faq
exports.edit = async (req, res, next) => {
    try {
        let payload = req.body
        const faq = await Faqs.findByIdAndUpdate({ _id: payload._id }, { $set: payload }, { new: true })
        return res.send({ success: true, message: 'Faq updated successfully', faq })
    } catch (error) {
        if (error.code === 11000 || error.code === 11001)
            checkDuplicate(error, res, 'Faqs')
        else
            return next(error)
    }
}

// API to delete Faq
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const faq = await Faqs.deleteOne({ _id: id })
            if (faq && faq.deletedCount)
                return res.send({ success: true, message: 'Faq deleted successfully', id })
            else return res.status(400).send({ success: false, message: 'Faq not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Faq Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get a Faq
exports.get = async (req, res, next) => {
    try {
        const { id } = req.params
        if (id) {
            const faq = await Faqs.findOne({ _id: id }, { question: 1, answer: 1, image: 1,createdAt:1 }).lean(true)
            if (faq)
                return res.json({ success: true, message: 'Faq retrieved successfully', data:faq })
            else return res.status(400).send({ success: false, message: 'Faq not found for given Id' })
        } else
            return res.status(400).send({ success: false, message: 'Faq Id is required' })
    } catch (error) {
        return next(error)
    }
}

// API to get Faq list
exports.list = async (req, res, next) => {
    try {
        let { page, limit } = req.query

        // fields for searching
        let {  question } = req.body
        page = page !== undefined && page !== '' ? parseInt(page) : 1
        limit = limit !== undefined && limit !== '' ? parseInt(limit) : 10

        let countDocument={}
        let dbQuery=[
                { $sort: { createdAt: -1 } },
                { $skip: limit * (page - 1) },
                { $limit: limit },
                {
                    $project: {
                        _id: 1, question: 1, answer: 1,createdAt: 1
                    }
                }
            ]
            
        if(question){
         countDocument={ question: { $regex: new RegExp(question), $options: "si" }, }
          var searchTerm= {
              $match: { question: { $regex: new RegExp(question), $options: "si" }, },
            }
            dbQuery.unshift(searchTerm)
        }

        const total = await Faqs.countDocuments(countDocument)
        const faqs = await Faqs.aggregate(dbQuery)
        
        if (page > Math.ceil(total / limit) && total > 0)
            page = Math.ceil(total / limit)

        return res.send({
            success: true, message: 'Faqs fetched successfully',
            data: {
                data:faqs,
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
