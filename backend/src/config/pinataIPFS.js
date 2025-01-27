const { pinataApiKey, pinataSecretKey, pinataJWT, pinataBaseUri} = require('./vars')
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(pinataApiKey, pinataSecretKey);
const fs = require('fs');

exports.testAuthentication = async() => {
    try {
        const res = await pinata.testAuthentication()
        return res
    } catch (error) {
        console.log("Pinata IPFS Error = ",error);
    }
}

exports.pinFileToIPFS = async (data) => {
    const options = {
        pinataMetadata: {
            name: `${Date.now()}`,
            // keyvalues: {
            //     customKey: 'customValue',
            //     customKey2: 'customValue2'
            // }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    const readableStreamForFile = fs.createReadStream(data);

    try {
        const result = pinata.pinFileToIPFS(readableStreamForFile, options)
        return result
    } catch (error) {
        return err
    }
}

exports.pinJSONToIPFS = async (data) => {
    const body = data
    const options = {
        pinataMetadata: {
            name: `${Date.now()}`,
            // keyvalues: {
            //     customKey: 'customValue',
            //     customKey2: 'customValue2'
            // }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

    try {
        const result = pinata.pinJSONToIPFS(body, options)
        return result
    } catch (error) {
        return err
    }
}