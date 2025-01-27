const Artist = require('../../models/artist.model')

// API to get Artist list
exports.list = async (req, res, next) => {
    try {

        let dbQuery=[
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        _id: 1, name: 1, description: 1, image: 1, imageCloudinaryUri: 1, learnMore: 1, createdAt: 1
                    }
                }
            ]
            
        const artists = await Artist.aggregate(dbQuery)
        
        return res.send({
            success: true, message: 'Artist fetched successfully',
            data: {
                data: artists,
            }
        })
    } catch (error) {
        return next(error)
    }
}
