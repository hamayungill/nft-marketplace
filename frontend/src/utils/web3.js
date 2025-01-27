import Web3 from 'web3';
import contractAbi from './abi/pizza-nft.json';
import { ENV } from '../config/config';
import { toast } from 'react-toastify';
import store from '../store'
import { SET_WALLET_ERROR, REDIRECT_TO_WALLET, DISCONNECT_USER } from '../redux/type';

const { nftMarketplaceContractAddress, web3ProviderAddress, requiredChainIds } = ENV

// let Contract = require("web3-eth-contract");
// Contract.setProvider(web3ProviderAddress);

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
            .send({ from, value })
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

export const getWeb3 = () => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        return web3;
    }
    else {
        return false;
    }
}

export const connectMetamask = async (web3 = null) => {
    if (!web3) {
        web3 = getWeb3();
    }
    if (!web3 || !window.ethereum) {
        store.dispatch(setWalletError("Please install Metamask Wallet in order to use all features of Marketplace"));
        return;
    }

    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    if (!requiredChainIds.includes(chainId)) {
        store.dispatch(setWalletError(`Please switch to ${ENV.requiredChainName} in order to use all features of Marketplace`));
    }
    return accounts[0];
}

export const signRequest = async () => {
    if (window.ethereum) {
        const web3 = getWeb3();
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const signature = await handleSignMessage(address);
        return signature;
    }
    else {
        alert("Please install Metamask in order to use all features of Marketplace");
    }
}

const setWalletError = (message) => {
    return {
        type: SET_WALLET_ERROR,
        payload: message
    }
}

// disconnect user data
export const disconnectUser = () => dispatch => {
    dispatch({
        type: DISCONNECT_USER,
    })
}

const accountsChangedHandler = () => {
    // if (window.ethereum) {
    //     window.ethereum.on('accountsChanged', function (accounts) {
    //         localStorage.clear()
    //         // store.dispatch(redirectToWallet())
    //     })
    //     window.ethereum.on('chainChanged', function (_chainId) {
    //         let chaindId = parseInt(_chainId, 16);
    //         if (requiredChainIds.includes(chaindId)) {
    //             store.dispatch(setWalletError(""));
    //         }
    //         else {
    //             store.dispatch(setWalletError(`Please switch to ${ENV.requiredChainName} in order to use all features of Marketplace`));
    //         }
    //     })
    // }
    let error = `Please switch to ${ENV.requiredChainName} in order to use all features of Marketplace`
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
            localStorage.clear()
            store.dispatch(setWalletError(""))
            store.dispatch(disconnectUser())
        })
        window.ethereum.on('chainChanged', function (_chainId) {
            let chaindId = parseInt(_chainId, 16);
            if (requiredChainIds.includes(chaindId)) {
                store.dispatch(setWalletError(""));
                localStorage.removeItem("walletError")
            }
            else {
                store.dispatch(setWalletError(error));
                localStorage.setItem("walletError", error)
            }
        })
        let web3 = new Web3(window.ethereum)
        web3.eth.net.getId().then((e) => {
            if (requiredChainIds.includes(e)) {
                store.dispatch(setWalletError(""));
                localStorage.removeItem("walletError")
            } else {
                store.dispatch(setWalletError(error));
                localStorage.setItem("walletError", error)
            }
        })
    }
}

const handleSignMessage = (address) => {
    return new Promise((resolve, reject) => {
        const web3 = getWeb3();
        web3.eth.personal.sign(
            web3.utils.fromUtf8(`${ENV.appName} uses this cryptographic signature in place of a password, verifying that you are the owner of this address.`),
            address,
            (err, signature) => {
                if (err) return reject(err);
                return resolve(signature);
            }
        )
    });
};

// check the total mints of the ingredients
export const checkIngredientMints = async (ingredientId) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const mints = await methods.call(pizzaNftContract.methods.checkMints, [ingredientId]);
        return mints;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

// get ingredients rarity and number of pizzas who used this ingredient
export const getIngredientsData = async (ingredientId) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const data = await methods.call(pizzaNftContract.methods.getIngredientRarity, [ingredientId])
        return data
    }
    catch (e) {
        return false;
    }
}

// purchase multiple ingredients
export const buyIngredients = async (ingIds, price, objIdsArr, userId) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }

    try {
        let connectedAddress = await connectMetamask(web3);
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        let weiPrice = web3.utils.toWei(`${price}`, 'ether');
        let from = connectedAddress;

        const tx = await methods.send(pizzaNftContract.methods.purchaseIngredients, [ingIds], from, weiPrice)
        const transferBalanceArray = tx?.events?.transferIngredients?.returnValues?.balancesTransferred
        let ingredientsData = []
        for (let index = 0; index < objIdsArr.length; index++) {
            ingredientsData.push({ _id: objIdsArr[index], balance: transferBalanceArray[index] })
        }

        let formObj = {
            ingredients: ingredientsData,
            userId
        }

        try {
            fetch(`${ENV.url}ingredient/buy-multiple-ingredients`, {
                method: 'POST',
                headers: {
                    'Authorization': ENV.Authorization,
                    'x-auth-token': ENV.x_auth_token,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(formObj)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    console.log(data.message)
                } else {
                    console.log(data.message)
                }
                return true
            }).catch(error => {
                if (error.response && error.response.data) {
                    const { data } = error.response
                    if (data.message)
                        console.log(data.message)
                }
                return false
            })
        } catch (error) {
            console.log("ERROR = ", error?.message)
            return false
        }
        return true

    } catch (e) {
        toast.error(e.message);
        return false;
    }
}

// for random bake and buyAndBake and bake pizza functionality
export const randomMintNBakePizza = async (id, _bakedPizzaTokenURI, base, sauce, cheese, meats, toppings, userID, type, accPrice, ingredientsIds) => {
    // not using any where, that why commented for now 
    const mintedIdsArray = []

    if (!base) {
        base = 0
    } else {
        mintedIdsArray.push(base)
    }

    if (!sauce) {
        sauce = 0
    } else {
        mintedIdsArray.push(sauce)
    }

    if (!cheese?.length || !cheese[0]) {
        cheese = [0]
    } else {
        cheese.map((e) => {
            mintedIdsArray.push(e)
        })
    }

    if (!meats?.length || !meats[0]) {
        meats = [0]
    } else {
        meats.map((e) => {
            mintedIdsArray.push(e)
        })
    }
    if (!toppings?.length || !toppings[0]) {
        toppings = [0]
    } else {
        toppings.map((e) => {
            mintedIdsArray.push(e)
        })
    }

    const web3 = await getWeb3();
    if (!web3) {
        toast.error("No web3 instance found.");
        return false;
    }
    try {
        let connectedAddress = await connectMetamask(web3);
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        let from = connectedAddress;
        let tx = null
        if (type === "randomBake") {
            console.log("Calling Random Bake Fn")
            let weiPrice = web3.utils.toWei(`${accPrice}`, 'ether');
            tx = await methods.send(pizzaNftContract.methods.randomBakePizzaAndMint, [_bakedPizzaTokenURI, base, sauce, cheese, meats, toppings], from, weiPrice)

        } else if (type === "buyAndBake") {
            // in case of buy and bake pizza
            let weiPrice = web3.utils.toWei(`${accPrice}`, 'ether');
            tx = await methods.send(pizzaNftContract.methods.buyAndBakePizzaAndMint, [_bakedPizzaTokenURI, base, sauce, cheese, meats, toppings], from, weiPrice)
            console.log("tx = ", tx)
        } else if (type === "bakeAndMint") {
            let weiPrice = web3.utils.toWei(`${accPrice}`, 'ether');
            tx = await methods.send(pizzaNftContract.methods.buyAndBakePizzaAndMint, [_bakedPizzaTokenURI, base, sauce, cheese, meats, toppings], from, weiPrice)
        } else { }

        if (tx) {
            let data = tx.events.mintRandomPizza.returnValues[1]
            let _pizzaId = data[0]
            const res = await callUpsertPizzaApi(_pizzaId, id, userID, ingredientsIds, type)
            return res
        }
    } catch (e) {
        return false;
    }
}


const callUpsertPizzaApi = async (_pizzaId, id, userID, ingredientsIds, type) => {
    if (_pizzaId) {

        let formObj = {
            '_id': id,
            '_pizzaId': _pizzaId,
            'userId': userID,
            'type': type,
            // this ingredientsIds is sent to decrement the balance from the userIngredient balance
            ingredientsIds
        }

        try {
            return new Promise((resolve, reject) => {
                fetch(`${ENV.url}pizza/upsert`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': ENV.Authorization,
                        'x-auth-token': ENV.x_auth_token,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(formObj)
                }).then(res => res.json()).then(data => {
                    console.log(data)
                    if (data.success) {
                        console.log(data.message)
                    } else {
                        console.log(data.message)
                    }
                    resolve(true)
                }).catch(error => {
                    if (error.response && error.response.data) {
                        const { data } = error.response
                        if (data.message)
                            console.log(data.message)
                    }
                    reject(false)
                })
            })
        } catch (error) {
            console.log("ERROR = ", error?.message)
            return false
        }
    }
}

// unbake pizza contract method
export const UnbakeBakePizza = async (id, ingIds, pizzaObjId) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let connectedAddress = await connectMetamask(web3);
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        let weiPrice = web3.utils.toWei(`${ENV.unbakeFee}`, 'ether');
        let from = connectedAddress;

        const tx = await methods.send(pizzaNftContract.methods.unbakePizza, [id, ingIds], from, weiPrice)

        console.log("unbake tx = ", tx)

        if (tx) {
            const res = deletePizzaApi(pizzaObjId)
            return res
        }

    } catch (e) {
        toast.error(e.message);
        return false;
    }
}

// call unbake Api (delete-pizza)
export const deletePizzaApi = async (pizzaObjId) => {
    try {
        return new Promise((resolve, reject) => {

            let url = `${ENV.url}pizza/delete/${pizzaObjId}`;

            fetch(url, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                }
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    resolve(true)
                } else {
                    reject(false)
                }
            }).catch(error => {
                if (error.response && error.response.data) {
                    const { data } = error.response
                    if (data.message)
                        console.log(data.message)
                }
                reject(false)
            })
        });
    } catch (e) {
        console.log("error");
        return false
    }
};


// rebake pizza contract method 
export const mintRebakePizza = async (pizzaObjectId, id, _bakedPizzaTokenURI, base, sauce, cheese, meats, toppings, oldIngIds, burnIds) => {
    console.log("pizzaObjectId, id, _bakedPizzaTokenURI, base, sauce, cheese, meats, toppings, oldIngIds, burnIds")
    console.log(pizzaObjectId, id, _bakedPizzaTokenURI, base, sauce, cheese, meats, toppings, oldIngIds, burnIds)
    if (!base) {
        base = 0
    }
    if (!sauce) {
        sauce = 0
    }
    if (!cheese.length || !cheese[0]) {
        cheese = [0]
    }
    if (!meats.length || !meats[0]) {
        meats = [0]
    }
    if (!toppings.length || !toppings[0]) {
        toppings = [0]
    }
    console.log("call 1")
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {

        let connectedAddress = await connectMetamask(web3);
        console.log("call 2")
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        console.log("call 3")
        let weiPrice = web3.utils.toWei(`${ENV.rebakeFee}`, 'ether');
        let from = connectedAddress;
        console.log("call 4")
        const tx = await methods.send(pizzaNftContract.methods.rebakePizza, [id, _bakedPizzaTokenURI, base, sauce, cheese, meats, toppings, oldIngIds, burnIds], from, weiPrice)

        if (tx) {
            let res = rebakePizzaApi(pizzaObjectId)
            return res
        }
    } catch (e) {
        toast.error(e.message);
        return false;
    }
}

// rebake pizza transation confirmation 
const rebakePizzaApi = (pizzaObjectId) => {
    try {
        return new Promise((resolve, reject) => {
            let formObj = {
                'pizzaObjectId': pizzaObjectId,
            }

            fetch(`${ENV.url}pizza/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': ENV.Authorization,
                    'x-auth-token': ENV.x_auth_token,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(formObj)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    console.log(data.message)
                } else {
                    console.log(data.message)
                }
                resolve(true)
            }).catch(error => {
                if (error.response && error.response.data) {
                    const { data } = error.response
                    if (data.message)
                        console.log(data.message)
                }
                reject(false)
            })

        });
    } catch (e) {
        console.log("error");
    }
};

export const weitoEth = async (amount) => {
    const web3 = await getWeb3();
    if (!web3 || !amount) {
        return 0;
    }
    const etherValue = await web3.utils.fromWei(`${amount}`, 'ether');
    return etherValue;
}

export const getRarityRewardPizza = async (_id) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const pizza = await methods.call(pizzaNftContract.methods.getRarityRewardPizza, [_id]);
        return pizza;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export const getTotalRarityRewards = async () => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const total = await methods.call(pizzaNftContract.methods.getTotalRarityRewards, []);
        console.log("total web3 = ", total)
        return total;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export const getClaimRewardAmount = async (accountAddress) => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const claimAmount = await methods.call(pizzaNftContract.methods.checkclaimableReward, [accountAddress]);
        return claimAmount
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const claimReward = async () => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let connectedAddress = await connectMetamask(web3);
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        let from = connectedAddress;
        const tx = await methods.send(pizzaNftContract.methods.claimReward, [], from)
        console.log(tx)
        if (tx) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.log(e)
        return false;
    }
}

export const getCurrentBlockNumber = async () => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    let currentBlockNumber = await web3.eth.getBlockNumber();
    return currentBlockNumber;
}

export const rewardToBeWon = async () => {
    const web3 = getWeb3();
    if (!web3) {
        toast.error("No web3 instance found");
        return false;
    }
    try {
        let pizzaNftContract = new web3.eth.Contract(contractAbi, nftMarketplaceContractAddress);
        const contractAmt = await methods.call(pizzaNftContract.methods.rewardToBeWon, []);
        const amtInEth = await weitoEth(contractAmt)
        // console.log("amtInEthamtInEthamtInEthamtInEthamtInEthamtInEthamtInEthamtInEth", contractAmt)
        return amtInEth / 100
    } catch (e) {
        console.log(e);
        return false;
    }
}

accountsChangedHandler();
