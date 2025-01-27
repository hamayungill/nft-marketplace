const cloudinary = require('cloudinary');
const { cloudinaryApiKey, cloudinaryApiSecret, cloudinaryUri, cloudinaryCloudName } = require('./vars')

cloudinary.config({ 
    cloud_name: cloudinaryCloudName, 
    api_key: cloudinaryApiKey, 
    api_secret: cloudinaryApiSecret,
    secure: true
});

exports.upload = async (path) => {
    try {
        const result = await cloudinary.v2.uploader.upload(path)
        return result
    } catch (error) {
        return error
    }
}