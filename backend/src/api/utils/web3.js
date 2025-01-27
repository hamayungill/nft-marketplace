var nftABI = require('../../api/utils/abi/contract-abi.json');
const { providerAddress, nftAddress, walletAccount, walletPK } = require("../../config/vars")
var Contract = require('web3-eth-contract');

const Web3 = require('web3');
var ethers = require('ethers');
const signers = new ethers.Wallet(walletPK);
let nftContract = new Contract(nftABI, nftAddress);
var web3 = new Web3(providerAddress);

const call = (method, params) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
        method(...params)
            .call()
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const send = (method, params, from, value) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
        method(...params)
            .send({from, value})
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const methods = {
    call,
    send,
};

const getWeb3 = () => {
    return web3
}

// get ingredients rarity and number of pizzas who used this ingredient
exports.getIngredientsData = async (ingredientId) => {
    const web3 = getWeb3();
    
    try {
        let pizzaNftContract = new web3.eth.Contract(nftABI, nftAddress);
        const data = await methods.call(pizzaNftContract.methods.getIngredientRarity, [ingredientId])
        return data
    }
    catch (e) {
        return false;
    }
}

exports.weitoEth = async (amount) => {
    const web3 = await getWeb3();
    if (!web3 || !amount) {
        return 0;
    }
    const etherValue = await web3.utils.fromWei(`${amount}`, 'ether');
    return etherValue;
}
exports.getCurrentBlockNumber = async () => {
    let currentBlockNumber = await web3.eth.getBlockNumber();
    return currentBlockNumber;
}

//edit
exports._upsertIngredient = async (ingredientTokenURI, price, artistAddress, categoryType, maxMints, name) => {
    const web3 = getWeb3(); 
    try {
        let pizzaNftContract = new web3.eth.Contract(nftABI, nftAddress);
        let weiPrice = web3.utils.toWei(`${price}`, 'ether');
        let priceHex = web3.utils.toHex(weiPrice)
        console.log("sending")
        const myData = await nftContract.methods.createIngredient(ingredientTokenURI, priceHex, artistAddress, categoryType, maxMints, name).encodeABI();
        let txCount = await web3.eth.getTransactionCount(walletAccount);
        const gas = await web3.eth.getGasPrice();
        const gasLimit1 = await web3.eth.estimateGas({
            from: walletAccount,
            nonce: txCount,
            to: nftAddress,
            data: myData,
        })

    let _id = 0
        await signers.signTransaction({
            "nonce": web3.utils.toHex(txCount), // 0 in decimal
            "gasLimit": web3.utils.toHex(gasLimit1), //21000 in decimal
            "gasPrice": web3.utils.toHex(gas), //2000000000 in decimal
            "to": nftAddress,
            // "value": "0x00", //100000000000000000 in decimal
            "data": web3.utils.toHex(myData), // “empty” value in decimal
            // "chainId": parseInt(chainId)
        })
        .then(async res => {
        let promises = [];
        promises.push(web3.eth.sendSignedTransaction(res, async (err,txResult)=>{
            tx=txResult;
            console.log("txResult", txResult)
        }));
        const response = await Promise.all(promises)
        console.log('resresresresresresresresresresresresresresresresresresres', response[0]?.logs[1]?.topics[1])
        const num = response[0]?.logs[1]?.topics[1]
        _id = parseInt(num, 16);
        console.log("in decimal = ", _id)
        })
        .catch(e => {
        console.error(`error occured during transaction Error ✊ : ${e}`)
        })
        console.log("returning")
        return _id
    }
    catch (e) {
        console.log("eeeeeeeeeeeeeeeeeee",e)
        return false;
    }
}
