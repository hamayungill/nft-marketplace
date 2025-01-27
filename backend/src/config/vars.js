const path = require('path');
// import .env variables
require('dotenv').config();
module.exports = {
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  encruptionKey: process.env.ENCRYPTION_KEY,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  frontEncSecret: process.env.FRONT_ENC_SECRET,
  ipfsBaseUrl: process.env.IPFS_BASE_URL,
  ipfsServerUrl: process.env.IPFS_SERVER_URL,
  adminUrl: process.env.ADMIN_URL,
  emailAdd: process.env.EMAIL,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  requiredChainIds: [],
  nftMarketplaceContractAddress: process.env.NFT_ADDRESS,
  mailgunPrivateKey: process.env.MAILGUN_PRIVATE_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  pwEncruptionKey: process.env.PW_ENCRYPTION_KEY,
  pwdSaltRounds: process.env.PWD_SALT_ROUNDS,
  nftAddress: process.env.NFT_ADDRESS,
  providerAddress: process.env.PROVIDER_ADDRESS,
  walletAccount: process.env.WALLET_ACCOUNT,
  walletPK: process.env.WALLET_PRIVATE_KEY,
  userDefaultImage: '/img/placeholder.png', // 'https://via.placeholder.com/600'
  categoryDefaultImage: '/img/placeholder.png',
  collectionDefaultImage: '/img/placeholder.png',
  globalImgPlaceholder: '/img/placeholder.png',

  pinataApiKey: process.env.PINATA_API_Key,
  pinataSecretKey: process.env.PINATA_API_Secret,
  pinataJWT: process.env.PINATA_JWT,
  pinataBaseUri: process.env.PINATA_BASE_URL,

  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryUri: process.env.CLOUDINARY_URL,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,

};
