import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import tableCloth from '../../assets/images/tablecloth.svg';
import randomGif from '../../assets/images/randomGif.gif';
import "./pizzaCaveRandomBake.css";
import { getRandomIngredients } from '../../redux/Ingredients/Ingredient.action';
import { connect } from 'react-redux';
import { toPng } from 'html-to-image';
import { ENV } from '../../config/config';
import { randomBakePizza, beforeBakePizza } from '../../redux/cave/cave.action';
import { randomMintNBakePizza } from '../../utils/web3';
import TransactionModal from '../transactionModal/transactionModal';
import Wallet from '../Wallet/Wallet';

function PizzaCaveRandomBake(props) {

	const [loader, setLoader] = useState(false)
	const [randomPizzaIngredients, setRandomPizzaIngredients] = useState([])

	// mintedIds
	//baseId, sauceId, cheeseId, meatId, toppingId
	const [baseId, setBaseId] = useState()
	const [sauceId, setSauceId] = useState()
	const [cheeseId, setCheeseId] = useState([])
	const [meatId, setMeatId] = useState([])
	const [toppingId, setToppingId] = useState([])

	// tx random bake 
	const [showTxRandomBakePizza, setShowTxRandomBakePizza] = useState(false)

	const [txRandomBakePizza, setTxRandomBakePizza] = useState(false)
	const [txRandomBakePizzaState, setTxRandomBakePizzaState] = useState(0)
	const [txRandomBakePizzaError, setTxRandomBakePizzaError] = useState(null)

	// connect wallet
	const [show, setShow] = useState(false);
	const [userAuth, setUserAuth] = useState()

	// for validation
	// const [baseMin, setBaseMin] = useState(1)
	// const [sauceMin, setSauceMin] = useState(1)
	// const [cheeseMin, setCheeseMin] = useState(1)
	// const [meatMin, setMeatMin] = useState(0)
	// const [toppingMin, setToppingMin] = useState(0)
	
	const { baseMin, sauceMin, cheeseMin, meatMin, toppingMin } = ENV


	useEffect(() => {
		if (!showTxRandomBakePizza) {
			setLoader(false)
		}
	}, [showTxRandomBakePizza])

	//Authentication from localStorage
	useEffect(() => {
		setUserAuth(props.userAuth)
	}, [props.userAuth])

	const handleClose = () => setShow(false);

	useEffect(() => {
		if (txRandomBakePizza) {
			props.beforeBakePizza()
			props.getRandomIngredients()
			setTxRandomBakePizzaState(1)
		}
	}, [txRandomBakePizza])

	useEffect(() => {
		if (props.randomPizzaIngredient?.success && props.getRandomPizzaIngredientAuth) {
			let randomPizzaIngredients = props.randomPizzaIngredient.data

			if (!randomPizzaIngredients?.base) {
				setTxRandomBakePizzaState(2)
				setTxRandomBakePizzaError("Not enough Ingredients Available!")
				return
			}

			let arrRandom = [randomPizzaIngredients?.base, randomPizzaIngredients?.sauce, ...randomPizzaIngredients?.cheese]
			if (randomPizzaIngredients?.meat) {
				arrRandom = [...arrRandom, ...randomPizzaIngredients?.meat]
			}

			if (randomPizzaIngredients?.topping) {
				arrRandom = [...arrRandom, ...randomPizzaIngredients?.topping]
			}
			setRandomPizzaIngredients([...arrRandom])
			imagesLoadCheck([...arrRandom])
		} else { }
	}, [props.randomPizzaIngredient])

	const imagesLoadCheck = async (arrRandom) => {
		const res = await checkImagesLoaded(arrRandom)
		console.log("calling bake random sreenshoot taker", res)
		if (res) {
			// call this to random bake screenshot
			bakeRandomPizza(arrRandom)
		}
	}

	useEffect(() => {
		if (props.cave.randomPizzaAuth) {
			if (props.cave.randomPizza.success) {
				let pizzaData = props.cave.randomPizza.data
				const { contentIpfs, _id, ingredients } = pizzaData
				if (props.user) {
					bakeRandomPizzaFn(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, props.user._id, ingredients)
				}
			}
		}
	}, [props.cave.randomPizzaAuth])

	const bakeRandomPizzaFn = async (_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, ingredients) => {
		let price = parseFloat(ENV.randomBakeFee)

		// calling the web3 fn which is used for random bake and buy and bake 
		const res = await randomMintNBakePizza(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, "randomBake", price, ingredients)
		setLoader(false)
		if (res) {
			props.beforeBakePizza()
			setTxRandomBakePizzaState(3)
		} else {
			props.beforeBakePizza()
			setTxRandomBakePizzaState(2)
			setRandomPizzaIngredients([])
		}
	}

	const bakeRandomPizza = async (arr) => {

		let ingredientIDsArr = []

		// checks to bake pizza
		let baseId = null
		let sauceId = null
		let cheeseId = []
		let meatId = []
		let toppingId = []

		Promise.all(arr.map(async (e) => {
			if (e) {
				ingredientIDsArr.push(e._id)
				if (e.catType === "base") {
					baseId = e._ingredientId
				} else if (e.catType === "sauce") {
					sauceId = e._ingredientId
				} else if (e.catType === "cheese") {
					cheeseId.push(e._ingredientId)
				} else if (e.catType === "meat") {
					meatId.push(e._ingredientId)
				} else if (e.catType === "topping") {
					toppingId.push(e._ingredientId)
				} else { }
			}
		}))

		let res = await pizzaValidation(baseId, sauceId, cheeseId, meatId, toppingId)

		const { isValid, errMsg } = res
		if (!isValid) {
			setTxRandomBakePizzaError(errMsg)
			setTxRandomBakePizzaState(2)
			return
		}

		// set the state for minted ids
		setBaseId(baseId)
		setSauceId(sauceId)
		setCheeseId(cheeseId)
		setMeatId(meatId)
		setToppingId(toppingId)
		// validations handle from the backend in random bake pizza

		// htmt to png
		toPng(document.getElementById("randomBakePizzaNode"), { cacheBust: true, })
			.then((dataUrl) => {
				// console.log('dataUrldataUrl =' ,dataUrl)
				let pizzaData = { isActive: true }
				pizzaData["image"] = dataUrl
				pizzaData["currentOwnerId"] = props.user._id
				pizzaData["creatorId"] = props.user._id
				pizzaData["ingredientIds"] = ingredientIDsArr

				props.randomBakePizza(pizzaData, "randomBake")
			})
			.catch((err) => {
				console.log(err)
			})
	}

	const checkImagesLoaded = async (arrRandom) => {
		for (let index = 0; index < arrRandom.length; index++) {
			const ele = arrRandom[index];
			if (ele && ele !== "undefined") {
				let loaded = document.getElementById(ele?._id)?.complete
				if (loaded !== true) {
					await sleep(400)
					let newArr = arrRandom.slice(index, arrRandom.length)
					return checkImagesLoaded(newArr)
				}
			}
		}
		return true
	}

	const sleep = async (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	const getIngredientsForRandomBake = async () => {
		setLoader(true)
		setShowTxRandomBakePizza(true)
		setTxRandomBakePizzaState(0)
	}

	// validation check before buy and bake pizza 
	const pizzaValidation = async (baseId, sauceId, cheeseId, meatId, toppingId) => {

		let isValid = true
		let errMsg = ''

		if (baseId.length < baseMin) {
			isValid = false
			errMsg = `Pizza must have ${baseMin} base.`
			return { isValid, errMsg }
		} else if (sauceId < sauceMin) {
			isValid = false
			errMsg = `Pizza must have ${sauceMin} sauce.`
			return { isValid, errMsg }
		} else if (cheeseId.length < cheeseMin) {
			isValid = false
			errMsg = `Pizza must have ${cheeseMin} cheese.`
			return { isValid, errMsg }
		} else if (meatId.length < meatMin) {
			isValid = false
			errMsg = `Pizza must have ${meatMin} meat.`
			return { isValid, errMsg }
		} else if (toppingId.length < toppingMin) {
			isValid = false
			errMsg = `Pizza must have ${toppingMin} topping.`
			return { isValid, errMsg }
		}

		return { isValid, errMsg }
	}

	return (
		<div className="pizza-random-bake">
			<div className="tab-detail">
				<h2 className="ff-lato fw-bold red-color mb-4">Random Bake</h2>
				<div className="page-description ff-lato">
					<p>Can’t decide what you want? Is ok, we have you covered! Get a completed pizza NFT with a random selection of ingredients. ({ENV.randomBakeFee} {ENV.appCurrency} + gas)</p>
				</div>
			</div>
			<Container fluid className="cave-section bg-grey">
				<div className="random-bake-holder">
					<div className="pizza-making-block d-flex justify-content-center position-relative">
						<div className="table-cloth-image position-relative" id="randomBakePizzaNode">
							<div className='cloth_image'>
								<img className="img-fluid" src={randomPizzaIngredients.length ? tableCloth : randomGif} alt="Table Cloth miror" />
							</div>
							{
								randomPizzaIngredients?.map((e, index) => {
									return (
										<div className='pizzaImage' key={index}>
											<img id={e?._id} src={e?.pizzaImageCloudinaryUrl} alt={e?.name} />
										</div>
									)
								})
							}
						</div>
						{loader === true ? <div className="cloth_image cloth-image-temporary">
							<img className="img-fluid" src={tableCloth} alt="Table Cloth miror" />
						</div> : ''}
					</div>
					<button className="btn-red-outline transition w-100 d-block w-100 mb-5" disabled={props.user?._id ? "" : "disabled"} onClick={() => getIngredientsForRandomBake()}>Random Bake ({ENV.randomBakeFee} {ENV.appCurrency})</button>
					{
						props.user?._id ? "" : <div className="connect-wallet"><p>Please <span onClick={() => { setShow(true) }}>connect</span> to wallet! </p></div>
					}
				</div>
			</Container>
			{
				showTxRandomBakePizza && <TransactionModal setShow={setShowTxRandomBakePizza} tx={setTxRandomBakePizza} txState={txRandomBakePizzaState} customError={txRandomBakePizzaError} />
			}
			{
				!userAuth &&
				<Wallet setUserAuth={setUserAuth} show={show} onHide={handleClose} />
			}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		randomPizzaIngredient: state?.ingredient?.randomPizzaIngredient,
		getRandomPizzaIngredientAuth: state?.ingredient?.getRandomPizzaIngredientAuth,
		user: state?.user?.userData,
		userAuth: state.user.userAuth,
		cave: state.cave,
	}
}

export default connect(mapStateToProps, { getRandomIngredients, randomBakePizza, beforeBakePizza })(PizzaCaveRandomBake)
