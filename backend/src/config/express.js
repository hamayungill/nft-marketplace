const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const frontAuth = require('../api/middlewares/front/auth');
const adminRoutes = require('../api/routes/v1/admin/index');
const frontRoutes = require('../api/routes/v1/front/index');
const error = require('../api/middlewares/error');
const path = require('path');
const rateLimit = require("express-rate-limit");
const bearerToken = require('express-bearer-token');
const cron = require('node-cron');
const Pizza = require("../api/models/pizza.model")

const compression = require('compression');
var nftABI = require('./../api/utils/abi/contract-abi.json');
var Contract = require('web3-eth-contract');
const { providerAddress, nftAddress, walletAccount, walletPK } = require("./../config/vars")

const Web3 = require('web3');
var ethers = require('ethers');
const signers = new ethers.Wallet(walletPK);
let nftContract = new Contract(nftABI, nftAddress);
var web3 = new Web3(providerAddress);

var initialBlockNumber = 0;
var targetBlockNumber = 0;
var randomNumber = 0;
/**
* Express instance
* @public
*/
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bearerToken());

app.use(methodOverride());
const apiRequestLimiterAll = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 90000
});

app.use("/v1/", apiRequestLimiterAll);

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// compress all responses
app.use(compression());

// mount admin api v1 routes
app.use('/v1/admin', adminRoutes);

// authentication middleware to enforce authnetication and authorization
app.use(frontAuth.userValidation);

// // authentication middleware to get token
// app.use(frontAuth.authenticate);

// mount admin api v1 routes
app.use('/v1/front', frontRoutes);

// Admin Site Build Path
app.use('/admin/', express.static(path.join(__dirname, '../../admin')))
app.get('/admin/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../admin', 'index.html'));
});

// route to send the current and target block number
app.get('/v1/front/block_number', function (req, res) {
  res.status(200).send({
    success: true,
    data: {
      initialBlockNumber: initialBlockNumber,
      targetBlockNumber : targetBlockNumber,
    },
  })
})

// Front Site Build Path
app.use('/', express.static(path.join(__dirname, '../../build')))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

const rarityRewardsCalculation = async () => {

  // get the lowest rarity pizza
  let query = [
    {
        $match: {
          _pizzaId: { $exists: true }
      },
    },
    {
      $lookup: {
          from: 'users',
          localField: 'currentOwnerId',
          foreignField: '_id',
          as: 'currentOwner'
      }
    },
    {
      $unwind: '$currentOwner',
    },
    {
      $project: {
          _id: 1, _pizzaId: 1, rarity: 1, imageCloudinaryUrl: 1, currentOwnerId: '$currentOwner.address'
      }
    },
    { $sort: { rarity: 1 } },
    { $limit: 1 },  
  ]

  const lowestRarityPizza = await Pizza.aggregate(query)
  if(lowestRarityPizza[0]){
    const {_pizzaId, rarity, currentOwnerId, imageCloudinaryUrl, _id} = lowestRarityPizza[0]
    let rarityWei = await web3.utils.toWei(`${rarity}`, 'ether');
    const myData = await nftContract.methods.sendRewardToRarestPizzaOwner(_pizzaId, rarityWei, currentOwnerId, imageCloudinaryUrl).encodeABI();
    let txCount = await web3.eth.getTransactionCount(walletAccount);
    const gas = await web3.eth.getGasPrice();
    const gasLimit1 = await web3.eth.estimateGas({
      from: walletAccount,
      nonce: txCount,
      to: nftAddress,
      data: myData,
    })
  
    await signers.signTransaction({
      "nonce": web3.utils.toHex(txCount), // 0 in decimal
      "gasLimit": web3.utils.toHex(gasLimit1), //21000 in decimal
      "gasPrice": web3.utils.toHex(gas), //2000000000 in decimal
      "to": nftAddress,
      "data": web3.utils.toHex(myData), // “empty” value in decimal
    })
    .then(async res => {
      let promises = [];
      promises.push(web3.eth.sendSignedTransaction(res, async (err,txResult)=>{
        tx=txResult;
      }));
      await Promise.all(promises)
    })
    .catch(e => {
      console.error(`error occured during transaction Error ✊ : ${e}`)
    })
  }
}

// Generate a random number
const generateRandomNumber = () => {
  let min = 900;
  let max = 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// target block and Current block number comparison
const compareBlocks = async () => {
  let currentBlockNumber = await getCurrentBlockNumber();
  if (currentBlockNumber && (currentBlockNumber >= targetBlockNumber)) {
    resetValues();
    rarityRewardsCalculation();
  }
}

// get current block number
const getCurrentBlockNumber = async () => {
  let currentBlockNumber = await web3.eth.getBlockNumber();
  return currentBlockNumber;
}

//initialize cron job to trigger after every 5 minutes, to check the block number
const initializeCronJob = async () => {
  cron.schedule('*/5 * * * *', () => {
    compareBlocks()
  });
}

// initial and Current block number comparison 
const resetValues = async () => {
  initialBlockNumber = await getCurrentBlockNumber();
  // randomNumber = await generateRandomNumber();
  randomNumber = 10000
  targetBlockNumber = initialBlockNumber+randomNumber;
  initializeCronJob();
}

resetValues();
module.exports = app;