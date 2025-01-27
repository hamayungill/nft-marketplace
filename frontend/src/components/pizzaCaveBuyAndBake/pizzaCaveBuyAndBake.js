import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SelectIngredient from '../selectIngredient/selectIngredient';
import CheckRarity from '../checkRarity/checkRarity';
import tableCloth from '../../assets/images/tablecloth.svg';
import { ingForBuyAndBake, beforeIngredient } from '../../redux/Ingredients/Ingredient.action';
import { ENV } from '../../config/config';
import { buyIngredients, randomMintNBakePizza } from '../../utils/web3';
import TransactionModal from '../transactionModal/transactionModal';
import { toPng } from 'html-to-image';
import { randomBakePizza, beforeBakePizza } from '../../redux/cave/cave.action'
import RarityTooltip from '../rarityTooltip/rarityTooltip'

function PizzaCaveBuyAndBake(props) {

	// for validation
	const { baseMin, sauceMin, cheeseMin, meatMin, toppingMin } = ENV

	const [loader, setLoader] = useState(true)
	const [errMsg, setErrMsg] = useState(false)

	const [buyAndBakeIngredients, setBuyAndBakeIngredients] = useState([])

	// to manage selected ingredients
	const [selectedBase, setSelectedBase] = useState([])
	const [selectedSauce, setSelectedSauce] = useState([])
	const [selectedCheese, setSelectedCheese] = useState([])
	const [selectedMeats, setSelectedMeats] = useState([])
	const [selectedToppings, setSelectedToppings] = useState([])

	// pizza ingredients
	const [pizzaIngredients, setPizzaIngredients] = useState([])
	const [pizzaIngredientsPrice, setPizzaIngredientsPrice] = useState(0)


	// transactions
	const [showTxBuyIngredient, setShowTxBuyIngredient] = useState(false)
	const [txBuyIngredient, setTxBuyIngredient] = useState(false)
	const [txBuyIngredientState, setTxBuyIngredientState] = useState(0)

	const [showTxBuyAndBakePizza, setShowTxBuyAndBakePizza] = useState(false)

	const [txBuyAndBakePizza, setTxBuyAndBakePizza] = useState(false)
	const [txBuyAndBakePizzaState, setTxBuyAndBakePizzaState] = useState(0)
	const [txBuyAndBakePizzaError, setTxBuyAndBakePizzaError] = useState(null)

	// mintedIds
	//baseId, sauceId, cheeseId, meatId, toppingId
	const [baseId, setBaseId] = useState([])
	const [sauceId, setSauceId] = useState([])
	const [cheeseId, setCheeseId] = useState([])
	const [meatId, setMeatId] = useState([])
	const [toppingId, setToppingId] = useState([])

	useEffect(() => {
		fetchByAndBakeIngredient()
	}, [])

	useEffect(() => {
		if (props.getIngredientsAuth) {
			setLoader(false)
			if (props.buyAndBakeIngredients?.length > 0) {
				setBuyAndBakeIngredients(props.buyAndBakeIngredients)
			} else {
				setErrMsg(true)
			}
		}
	}, [props.getIngredientsAuth])

	const sortIng = (ing) => {
		const sorted = ing?.sort((a, b) => a.layerNum - b.layerNum)
		setPizzaIngredients([...sorted])
	}

	useEffect(() => {
		sortIng([...selectedBase, ...selectedSauce, ...selectedCheese, ...selectedMeats, ...selectedToppings])
	}, [selectedBase, selectedSauce, selectedCheese, selectedMeats, selectedToppings])

	useEffect(() => {
		const res = calculatePizzaIngredientsPrice()
		setPizzaIngredientsPrice(res)
	}, [pizzaIngredients])

	useEffect(() => {
		if (props.cave.buyAndBakePizzaAuth) {
			if (props.cave.buyAndBakePizza.success) {
				let pizzaData = props.cave.buyAndBakePizza.data
				const { contentIpfs, _id, ingredients } = pizzaData
				if (props.user) {
					buyAndBakePizzaFn(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, props.user._id, ingredients)
				}
			}
		}
	}, [props.cave.buyAndBakePizzaAuth])

	useEffect(() => {
		if (txBuyIngredient) {
			buySelectedIngredients()
			setTxBuyIngredientState(1)
		}
	}, [txBuyIngredient])

	useEffect(() => {
		if (txBuyAndBakePizza) {
			buyAndBakePizza()
			setTxBuyAndBakePizzaState(1)
		}
	}, [txBuyAndBakePizza])

	const buyAndBakePizzaFn = async (_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, ingredientsIds) => {

		if (userID) {
			let price = pizzaIngredientsPrice + parseFloat(ENV.bakeFee)

			// calling the web3 fn which is used for random bake and buy and bake 
			const res = await randomMintNBakePizza(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, "buyAndBake", price, ingredientsIds)
			if (res) {
				setLoader(true)
				setSelectedBase([])
				setSelectedSauce([])
				setSelectedCheese([])
				setSelectedMeats([])
				setSelectedToppings([])
				setPizzaIngredients([])
				setPizzaIngredientsPrice(0)
				fetchByAndBakeIngredient()
				props.beforeBakePizza()
				setTxBuyAndBakePizzaState(3)
			} else {
				props.beforeBakePizza()
				setTxBuyAndBakePizzaState(2)
			}
		}
	}

	const fetchByAndBakeIngredient = () => {
		props.beforeIngredient()
		props.ingForBuyAndBake()
	}

	const calculatePizzaIngredientsPrice = () => {
		let ingredientsPrice = 0
		Promise.all(pizzaIngredients.map((e) => {
			ingredientsPrice += parseFloat(e.price)
			return {};
		}))
		return ingredientsPrice
	}

	const makeIngredientsData = async () => {
		let accPrice = 0
		let ingIds = []
		let objIdsArr = []

		// calculate ingredient price
		Promise.all(pizzaIngredients.map((e) => {
			accPrice = accPrice + e.price;
			ingIds.push(e._ingredientId)
			objIdsArr.push(e._id)
			return {};
		}))
		accPrice = parseFloat(accPrice.toFixed(6));
		return { ingIds, accPrice, objIdsArr }
	}

	// buy selected ingredients
	const buySelectedIngredients = async () => {
		const { ingIds, accPrice, objIdsArr } = await makeIngredientsData()

		if (props?.user) {
			let userId = props?.user?._id
			const res = await buyIngredients(ingIds, accPrice, objIdsArr, userId)
			if (res) {
				setLoader(true)
				setSelectedBase([])
				setSelectedSauce([])
				setSelectedCheese([])
				setSelectedMeats([])
				setSelectedToppings([])
				setPizzaIngredients([])
				setPizzaIngredientsPrice(0)
				fetchByAndBakeIngredient()
				setTxBuyIngredientState(3)
			} else {
				setTxBuyIngredientState(2)
			}
		}
	}

	// buy and bake pizza
	const buyAndBakePizza = async () => {
		props.beforeBakePizza()
		callBuyAndBakePizzaAPI()
	}

	// buy and bake pizza api call
	const callBuyAndBakePizzaAPI = async (e) => {

		let ingredientIDsArr = []
		let price = 0

		// checks to bake pizza
		let baseId = []
		let sauceId = []
		let cheeseId = []
		let meatId = []
		let toppingId = []

		Promise.all(pizzaIngredients.map(async (e) => {
			ingredientIDsArr.push(e._id)
			price += e.price
			if (e.catType === "base") {
				baseId.push(e._ingredientId)
			} else if (e.catType === "sauce") {
				sauceId.push(e._ingredientId)
			} else if (e.catType === "cheese") {
				cheeseId.push(e._ingredientId)
			} else if (e.catType === "meat") {
				meatId.push(e._ingredientId)
			} else if (e.catType === "topping") {
				toppingId.push(e._ingredientId)
			} else { }
		}))

		let res = await pizzaValidation(baseId, sauceId, cheeseId, meatId, toppingId)

		const { isValid, errMsg } = res
		if (!isValid) {
			setTxBuyAndBakePizzaError(errMsg)
			setTxBuyAndBakePizzaState(2)
			return
		}

		// set the state for minted ids
		setBaseId(baseId)
		setSauceId(sauceId)
		setCheeseId(cheeseId)
		setMeatId(meatId)
		setToppingId(toppingId)

		// htmt to png
		toPng(document.getElementById("buyAndBakePizzaNode"), { cacheBust: true, })
			.then((dataUrl) => {
				let pizzaData = { isActive: true }
				pizzaData["image"] = dataUrl
				pizzaData["currentOwnerId"] = props.user._id
				pizzaData["creatorId"] = props.user._id
				pizzaData["ingredientIds"] = ingredientIDsArr

				props.randomBakePizza(pizzaData, "buyAndBake")
			})
			.catch((err) => {
				console.log(err)
			})
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

	const bakePrice = () => {
		let p = pizzaIngredientsPrice + parseFloat(ENV.bakeFee)
		p = p.toFixed(2)
		return p
	}

	return (
		<React.Fragment>
			<div className="tab-detail">
				<h2 className="ff-lato fw-bold red-color mb-4">Buy Ingredients and Bake a Pizza</h2>
				<div className="page-description ff-lato">
					<p>Select from a delightful selection of hand-crafted ingredients freshly prepared by our pixel artistes. You can buy now and bake later, or buy and bake in one transaction. ({ENV.ingredientPrice} {ENV.appCurrency} per ingredient + {ENV.bakeFee} {ENV.appCurrency} Baking fee.)</p>
				</div>
			</div>
			<Container fluid className="cave-section">
				<Row className="row-left-right">
					<Col lg={6} className="left-col d-none d-lg-block">
						<SelectIngredient loader={loader} errMsg={errMsg} buyAndBakeIngredients={buyAndBakeIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} />
					</Col>
					<Col lg={6} className="right-col">
						<div className="pizza-col">
							<Tabs defaultActiveKey="yourSelection" id="uncontrolled-tab-example2" className="justify-content-center pizza-tabs">
								{
									window.matchMedia('(max-width:991px)').matches ?
										<Tab eventKey="ingredients" className="hide-tab" title="Ingredients">
											<SelectIngredient loader={loader} errMsg={errMsg} buyAndBakeIngredients={buyAndBakeIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} />
										</Tab> : ''
								}
								<Tab eventKey="yourSelection" title="Your Selection">
									<div className="pizza-making-block d-flex justify-content-center">
										<div className="table-cloth-image" id="buyAndBakePizzaNode">
											<div className='cloth_image'>
												<img className="img-fluid" src={tableCloth} alt="Table Cloth miror" />
											</div>
											{
												pizzaIngredients?.map((e) => {
													return (
														<div className='pizzaImage'>
															<img src={e.pizzaImageCloudinaryUrl ? e.pizzaImageCloudinaryUrl : ""} alt={e.name} />
														</div>
													)
												})
											}
										</div>
									</div>
									<div className="added-ingredients">
										<div className="d-flex justify-content-between mb-5 ff-lato fw-bold">
											<span className="igredient-text">Ingredients Selected</span>
											<span className="ingredient-count red-color">{pizzaIngredients.length}</span>
										</div>
										<ul className="list-unstyled ingredients-list ff-press-start mb-5">
											{pizzaIngredients?.map((e, index) => {
												return (
													<li className="d-flex justify-content-between" key={index}>
														<span className="ingredient-name">{e.name}</span>
														<span className="ingredient-price red-color">{e.price}</span>
													</li>
												)
											})}
										</ul>
										<button className="btn-red-outline transition d-block w-100 mb-3" disabled={pizzaIngredients.length > 0 && props.user?._id ? false : true} onClick={() => { setShowTxBuyIngredient(true); setTxBuyIngredientState(0) }}>Buy Ingredients Only ({pizzaIngredientsPrice.toFixed(2)} {ENV.appCurrency})</button>
										<button className="btn-red-outline transition d-block w-100 mb-3" disabled={pizzaIngredients.length > 0 && props.user?._id ? false : true} onClick={() => { setShowTxBuyAndBakePizza(true); setTxBuyAndBakePizzaState(0) }}>Buy &amp; Bake ({bakePrice()} {ENV.appCurrency})</button>
									</div>
								</Tab>
								<Tab eventKey="check-rarity" title={<div className='rarity-wrap'><span>Check Rarity</span> <RarityTooltip /></div>} >
									{props.buyAndBakeIngredients && <CheckRarity ingredients={props.buyAndBakeIngredients} />}
								</Tab>

							</Tabs>
						</div>
					</Col>
				</Row>
			</Container>
			{
				showTxBuyIngredient && <TransactionModal setShow={setShowTxBuyIngredient} tx={setTxBuyIngredient} txState={txBuyIngredientState} />
			}

			{
				showTxBuyAndBakePizza && <TransactionModal setShow={setShowTxBuyAndBakePizza} tx={setTxBuyAndBakePizza} txState={txBuyAndBakePizzaState} customError={txBuyAndBakePizzaError} />
			}
		</React.Fragment>
	);
}

const mapStateToProps = (state) => {
	return {
		buyAndBakeIngredients: state?.ingredient?.ingredients,
		getIngredientsAuth: state?.ingredient?.getIngredientsAuth,
		user: state?.user?.userData,
		cave: state.cave,

	}
}

export default connect(mapStateToProps, { ingForBuyAndBake, beforeIngredient, randomBakePizza, beforeBakePizza })(PizzaCaveBuyAndBake);
