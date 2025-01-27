import React, { useEffect, useState } from 'react';
import { ingForBuyAndBake, beforeIngredient } from '../../redux/Ingredients/Ingredient.action';
import { getWalletData, beforeWalletData } from '../Wallet/Wallet.action';
import { connect } from 'react-redux'
import { Container, Tabs, Tab, Row, Col } from 'react-bootstrap';
import SelectIngredient from '../selectIngredient/selectIngredient';
import YourPizzas from '../yourPizzas/yourPizzas';
import CheckRarity from '../checkRarity/checkRarity';
import tableCloth from '../../assets/images/tablecloth.svg';
import { ENV } from '../../config/config';
import TransactionModal from '../transactionModal/transactionModal';
import { toPng } from 'html-to-image';
import { rebakedPizza, beforeBakePizza } from '../../redux/cave/cave.action'
import { mintRebakePizza } from '../../utils/web3'
import RarityTooltip from '../rarityTooltip/rarityTooltip';
function PizzaCaveReBake(props) {

	const [pizzas, setPizzas] = useState([])
	const [loader, setLoader] = useState(true)
	const [errMsg, setErrMsg] = useState(false)

	// pizza ingredients
	const [ingPizza, setIngPizza] = useState([])
	const [burnAndKeepArr, setBurnAndKeepArr] = useState([])
	const [burnIngId, setBurnIngId] = useState([])

	// selected pizza
	const [selectedPizza, setSelectedPizza] = useState(null)

	// ingredients
	const [loaderIng, setLoaderIng] = useState(true)
	const [errMsgIng, setErrMsgIng] = useState(false)

	const [walletIngredients, setwalletIngredients] = useState([])

	// to manage selected ingredients
	const [selectedBase, setSelectedBase] = useState([])
	const [selectedSauce, setSelectedSauce] = useState([])
	const [selectedCheese, setSelectedCheese] = useState([])
	const [selectedMeats, setSelectedMeats] = useState([])
	const [selectedToppings, setSelectedToppings] = useState([])

	// rebake tx 
	const [showTxRebakePizza, setShowTxRebakePizza] = useState(false)

	const [txRebakePizza, setTxRebakePizza] = useState(false)
	const [txRebakePizzaState, setTxRebakePizzaState] = useState(0)
	const [txRebakePizzaError, setTxRebakePizzaError] = useState(null)

	// mintedIds
	//baseId, sauceId, cheeseId, meatId, toppingId
	const [baseId, setBaseId] = useState([])
	const [sauceId, setSauceId] = useState([])
	const [cheeseId, setCheeseId] = useState([])
	const [meatId, setMeatId] = useState([])
	const [toppingId, setToppingId] = useState([])

	// for validation
	const { baseMin, sauceMin, cheeseMin, meatMin, toppingMin, baseMax, sauceMax, cheeseMax, meatMax, toppingMax } = ENV

	useEffect(() => {
		props.beforeWalletData()
		// props.beforeIngredient()
		props.ingForBuyAndBake()
	}, [])

	useEffect(() => {
		if (props.getWalletIgredientsAuth) {
			setLoaderIng(false)
			if (props.ingredients?.length > 0) {
				setwalletIngredients(props.ingredients)
			} else {
				setErrMsgIng(true)
			}
		}
	}, [props.getWalletIgredientsAuth])

	useEffect(() => {
		if (props?.user) {
			props.getWalletData(props?.user?._id, "ingredient")
			props.getWalletData(props?.user?._id, "pizza")
			setErrMsg(false)
			setLoader(true)
		} else {
			setErrMsg(true)
			setLoader(false)
			setPizzas(null)
			setSelectedPizza(null)
			setIngPizza([])
			setBurnAndKeepArr([])
		}
	}, [props?.user])


	useEffect(() => {
		if (props.getWalletPizzasAuth) {
			setLoader(false)
			if (props.bakedPizzas.length > 0) {
				setPizzas(props.bakedPizzas)
				setErrMsg(false)
			} else {
				setErrMsg(true)
			}
		}
	}, [props.getWalletPizzasAuth])

	const sortIng = (ing) => {
		const sorted = ing?.sort((a, b) => a.layerNum - b.layerNum)
		console.log("setting ==== >, sorted")
		setIngPizza([...sorted])
	}

	useEffect(() => {
		if (selectedPizza?.ingredients && props.buyAndBakeIngredients) {
			let res = []
			for (let i = 0; i < selectedPizza?.ingredients.length; i++) {
				const e = selectedPizza?.ingredients[i]
				let findOneIng = null;
				findOneIng = props.buyAndBakeIngredients.filter(ing => ing._id === e)
				res.push(findOneIng[0])
			}
			sortIng(res)

			// setIngPizza(res)
			setBurnAndKeepArr(res)
			setSelectedBase([])
			setSelectedSauce([])
			setSelectedCheese([])
			setSelectedMeats([])
			setSelectedToppings([])
			setBurnIngId([])
		}
		if (selectedPizza === null) {
			setIngPizza([])
			setBurnAndKeepArr([])
			setSelectedBase([])
			setSelectedSauce([])
			setSelectedCheese([])
			setSelectedMeats([])
			setSelectedToppings([])
			setBurnIngId([])
		}
	}, [selectedPizza])

	// adding the id in burnIngredients arr
	const burnIngredients = async (id, type) => {
		setBurnIngId([...burnIngId, id])
		IngPizzaRemoval(id)
	}

	// remove from pizza ingredients ingPizza
	const IngPizzaRemoval = (id) => {
		let arr = []
		Promise.all(
			ingPizza.map((e) => {
				if (e._id !== id) {
					arr.push(e)
				} else {
				}
			})
		)
		sortIng(arr)
		// setIngPizza(arr)
	}

	// removing the id from burnIngredients arr
	const KeepIngredients = async (id, type) => {
		const res = await checkValidationOnAddIng(type)
		if (res) {
			let arr = []
			Promise.all(
				burnIngId.map((e) => {
					if (e !== id) {
						arr.push(e)
					}
				})
			)
			setBurnIngId(arr)
			Promise.all(burnAndKeepArr.map((e) => {
				if (e._id === id) {
					sortIng([...ingPizza, e])
					// setIngPizza([...ingPizza, e])
				}
			}))
		}
	}

	// handle check if there is no pizza selected and user add ingredients
	useEffect(() => {
		if (selectedBase.length || selectedSauce.length || selectedCheese.length || selectedMeats.length || selectedToppings.length) {

			if (!selectedPizza) {

				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Please Select Pizza!")

				setSelectedBase([])
				setSelectedSauce([])
				setSelectedCheese([])
				setSelectedMeats([])
				setSelectedToppings([])
				setIngPizza([])
			}

		}
	}, [selectedBase, selectedSauce, selectedCheese, selectedMeats, selectedToppings])

	const checkValidationOnAddIng = (type) => {
		let baseCount = 0
		let sauceCount = 0
		let cheeseCount = 0
		let meatCount = 0
		let toppingCount = 0

		Promise.all(ingPizza.map((e) => {
			if (e?.catType === type && type === "base") {
				baseCount += 1
			} else if (e?.catType === type && type === "sauce") {
				sauceCount += 1
			} else if (e?.catType === type && type === "cheese") {
				cheeseCount += 1
			} else if (e?.catType === type && type === "meat") {
				meatCount += 1
			} else if (e?.catType === type && type === "topping") {
				toppingCount += 1
			} else { }
		}))

		let validate = true
		if (type === "base") {
			if (baseCount >= baseMax) {
				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Pizza can have only 1 base.")
				validate = false
			}
		} else if (type === "sauce") {
			if (sauceCount >= sauceMax) {
				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Pizza can have only 1 sauce.")
				validate = false
			}
		} else if (type === "cheese") {
			if (cheeseCount >= cheeseMax) {
				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Pizza can have atleast 1 cheese.")
				validate = false
			}
		} else if (type === "meat") {
			if (meatCount >= meatMax) {
				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Pizza can have upto 4 meats.")
				validate = false
			}
		} else if (type === "topping") {
			if (toppingCount >= toppingMax) {
				setShowTxRebakePizza(true)
				setTxRebakePizzaState(2)
				setTxRebakePizzaError("Pizza can have upto 4 toppings.")
				validate = false
			}
		}
		return validate
	}

	const onIngredientSelectedChange = (ingredients, type) => {
		const res = checkValidationOnAddIng(type)
		if (res) {
			console.log("ingredientsingredientsingredients", ingredients)
			// when validation done, insert new added ingredient into the array 
			let arrAfterRemove = []
			for (let index = 0; index < ingredients.length; index++) {
				const e = ingredients[index];
				for (let index = 0; index < ingPizza.length; index++) {
					const elem = ingPizza[index];
					if (e._id !== elem?._id) {
						arrAfterRemove.push(elem)
					} else { }
				}
			}
			setIngPizza([...ingredients, ...arrAfterRemove])
		} else {
			if (type === "base") {
				let arr = selectedBase
				arr.pop()
				setSelectedBase([...arr])
			} else if (type === "sauce") {
				let arr = selectedSauce
				arr.pop()
				setSelectedSauce([...arr])
			} else if (type === "cheese") {
				let arr = selectedCheese
				arr.pop()
				setSelectedCheese([...arr])
			} else if (type === "meat") {
				let arr = selectedMeats
				arr.pop()
				setSelectedMeats([...arr])
			} else if (type === "base") {
				let arr = selectedToppings
				arr.pop()
				setSelectedToppings([...arr])
			} else { }
		}
	}

	// validation check before rebake pizza 
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

	useEffect(() => {
		if (txRebakePizza) {
			rebakePizza()
			setTxRebakePizzaState(1)
		}
	}, [txRebakePizza])

	const rebakePizza = async () => {
		const rebakeIngredientsIds = []

		// checks to bake pizza
		let baseId = []
		let sauceId = []
		let cheeseId = []
		let meatId = []
		let toppingId = []

		Promise.all(ingPizza.map(async (e) => {
			console.log("hi chips === ", e)
			console.log("jawan ===> ", e?._id, e?.id)
			rebakeIngredientsIds.push(e?._id)
			if (e.catType === "base") {
				baseId.push(e?._ingredientId)
			} else if (e.catType === "sauce") {
				sauceId.push(e?._ingredientId)
			} else if (e.catType === "cheese") {
				cheeseId.push(e?._ingredientId)
			} else if (e.catType === "meat") {
				meatId.push(e?._ingredientId)
			} else if (e.catType === "topping") {
				toppingId.push(e?._ingredientId)
			} else { }
		}))

		let res = await pizzaValidation(baseId, sauceId, cheeseId, meatId, toppingId)
		const { isValid, errMsg } = res
		if (!isValid) {
			setTxRebakePizzaError(errMsg)
			setTxRebakePizzaState(2)
			return
		}

		// set the state for minted ids
		setBaseId(baseId)
		setSauceId(sauceId)
		setCheeseId(cheeseId)
		setMeatId(meatId)
		setToppingId(toppingId)

		// htmt to png
		toPng(document.getElementById("rebakePizzaNode"), { cacheBust: true, })
			.then((dataUrl) => {
				let rebakePizzaData = {
					image: dataUrl,
					ingredientIds: rebakeIngredientsIds,
					burnIngIds: burnIngId,
					pizzaObjectId: selectedPizza?._id
				}
				props.rebakedPizza(rebakePizzaData)
			})
			.catch((err) => {
				console.log(err)
			})
	}

	useEffect(async () => {
		if (props.cave.rebakedPizzaAuth) {
			if (props.cave.rebakedPizza.success) {

				let pizzaData = props.cave.rebakedPizza.pizza
				const { contentIpfs, _pizzaId: _id, pizzaObjectId, ingredients } = pizzaData
				rebakeFn(pizzaObjectId, _id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId)

			}
		}

	}, [props.cave.rebakedPizzaAuth])

	const rebakeFn = async (pizzaObjectId, _id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId) => {
		let newIngredients = [baseId]
		if (sauceId) {
			newIngredients.push(sauceId)
		}
		if (cheeseId) {
			newIngredients.push(cheeseId)
		}
		if (meatId) {
			for (let index = 0; index < meatId.length; index++) {
				const element = meatId[index];
				newIngredients.push(element)
			}
		}
		if (toppingId) {
			for (let index = 0; index < toppingId.length; index++) {
				const element = toppingId[index];
				newIngredients.push(element)
			}
		}

		let oldIngredients = []
		Promise.all(burnAndKeepArr.map((e) => {
			oldIngredients.push(e._ingredientId)
		}))

		// find the burn ingredients
		let arr1 = oldIngredients
		let arr2 = newIngredients

		let burnIds = []
		for (let index = 0; index < arr1.length; index++) {
			let ele1 = arr1[index];
			let isPresent = arr2.includes(ele1);
			if (!isPresent) {
				burnIds.push(ele1)
			}
		}

		// calling the contract mehtod mintNBakePizza
		const res = await mintRebakePizza(pizzaObjectId, _id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, oldIngredients, burnIds)
		if (res) {
			setErrMsg(false)
			setLoader(true)
			setErrMsgIng(false)
			setLoaderIng(true)
			props.beforeBakePizza()
			props.beforeWalletData()
			props.getWalletData(props?.user?._id, "ingredient")
			props.getWalletData(props?.user?._id, "pizza")
			setTxRebakePizzaState(3)
		} else {
			setTxRebakePizzaState(2)
		}
		setSelectedPizza(null)
		// setPizzas(null)
		setIngPizza([])
		setBurnAndKeepArr([])
		setSelectedBase([])
		setSelectedSauce([])
		setSelectedCheese([])
		setSelectedMeats([])
		setSelectedToppings([])
		setBurnIngId([])
	}

	const isRebakeEnable = () => {
		if (selectedPizza && (burnIngId.length || selectedBase.length || selectedSauce.length || selectedCheese.length || selectedMeats.length || selectedToppings.length)) {
			return false
		} else {
			return true
		}
	}

	return (
		<React.Fragment>
			<div className="tab-detail">
				<h2 className="ff-lato fw-bold red-color mb-4">Rebake ({ENV.rebakeFee} {ENV.appCurrency})</h2>
				<div className="page-description ff-lato">
					<p>Customize a pizza you already hold. Add ingredients from your wallet or remove* ingredients to improve your Rarity Reward Score.
						(*removed ingredients are burned and not returned to your wallet. This process is irreversible.)</p>
				</div>
			</div>
			<Container fluid className="cave-section">
				<Row className="row-left-right">
					<Col lg={6} className="left-col d-none d-lg-block">
						<div className="pizza-col">
							<Tabs defaultActiveKey="myPizzas" id="uncontrolled-tab-example3" className="justify-content-center pizza-tabs">
								<Tab eventKey="myPizzas" title="My Pizzas">
									<YourPizzas bakedPizzas={pizzas} loader={loader} errMsg={errMsg} setSelectedPizza={setSelectedPizza} selectedPizza={selectedPizza} forComponent="rebake" />
								</Tab>
								{
									props?.userAuth &&
									<Tab eventKey="myIngredients" title="My Ingredients">
										<SelectIngredient loader={loaderIng} errMsg={errMsgIng} buyAndBakeIngredients={walletIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} forComponent="rebake" ingPizza={ingPizza} setIngPizza={setIngPizza} />
									</Tab>
								}
							</Tabs>
						</div>
					</Col>
					<Col lg={6} className="right-col">
						<div className="pizza-col">
							<Tabs defaultActiveKey="yourSelection" id="uncontrolled-tab-example2" className="justify-content-center pizza-tabs">
								{
									window.matchMedia('(max-width:991px)').matches ?
										<Tab eventKey="myPizzas" title="My Pizzas">
											<YourPizzas bakedPizzas={pizzas} loader={loader} errMsg={errMsg} setSelectedPizza={setSelectedPizza} selectedPizza={selectedPizza} forComponent="rebake" />
										</Tab>
										: ''
								}
								{
									window.matchMedia('(max-width:991px)').matches ?
										props?.userAuth &&
										<Tab eventKey="myIngredients" title="My Ingredients">
											<SelectIngredient loader={loaderIng} errMsg={errMsgIng} buyAndBakeIngredients={walletIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} forComponent="rebake" ingPizza={ingPizza} setIngPizza={setIngPizza} />
										</Tab>
										: ''
								}
								<Tab eventKey="yourSelection" title="Your Selection">
									<div className="pizza-making-block d-flex justify-content-center">
										<div className="table-cloth-image" id="rebakePizzaNode">
											<div className="table-cloth-image">
												<img className="img-fluid" src={tableCloth} alt="Table Cloth Iage" />
											</div>
											{
												ingPizza?.map((e, index) => {
													return (
														<div className='pizzaImage' key={index}>
															<img src={e?.pizzaImageCloudinaryUrl} alt={e?.name} />
														</div>
													)
												})
											}
										</div>
									</div>
									<div className="added-ingredients">
										<div className="d-flex justify-content-between mb-5 ff-lato fw-bold text-center">
											<span className="igredient-text unbake-text">Burn Ingredients or add ingredients from your wallet</span>
										</div>
										<ul className="list-unstyled ingredients-list ff-press-start mb-5">
											{
												burnAndKeepArr?.map((item, index) => {
													return (
														<li className="d-flex justify-content-between align-items-center" key={index}>
															{
																burnIngId.includes(item?._id) ?
																	<span className="ingredient-name text-decoration-line-through">{ENV.capitalizeFirstLetter(item?.name)}</span> :
																	<span className="ingredient-name">{ENV.capitalizeFirstLetter(item?.name)}</span>
															}
															{
																burnIngId.includes(item?._id) ?
																	<button className="btn-red-outline ff-lato" onClick={() => { KeepIngredients(item?._id, item?.catType) }}>Undo</button> :
																	<button className="btn-red-outline ff-lato" onClick={() => { burnIngredients(item?._id, item?.catType) }}>Burn</button>
															}
														</li>
													)
												})
											}
										</ul>
										<button className="btn-red-outline transition d-block w-100 mb-3" disabled={isRebakeEnable()} onClick={() => { setShowTxRebakePizza(true); setTxRebakePizzaState(0) }} >Rebake Pizza ({ENV.rebakeFee} {ENV.appCurrency})</button>
									</div>
								</Tab>
								<Tab eventKey="check-rarity" title={<div className='rarity-wrap'><span>Check Rarity</span> <RarityTooltip /></div>} >
									<CheckRarity />
								</Tab>
							</Tabs>
						</div>
					</Col>
				</Row>
			</Container>
			{
				showTxRebakePizza && <TransactionModal setShow={setShowTxRebakePizza} tx={setTxRebakePizza} txState={txRebakePizzaState} customError={txRebakePizzaError} />
			}
		</React.Fragment>
	);
}
const mapStateToProps = (state) => {
	return {
		user: state?.user?.userData,
		userAuth: state?.user?.userAuth,
		bakedPizzas: state?.wallet?.walletPizzas,
		ingredients: state?.wallet?.walletIngredients,
		getWalletIgredientsAuth: state?.wallet?.getWalletIgredientsAuth,
		getWalletPizzasAuth: state.wallet.getWalletPizzasAuth,
		buyAndBakeIngredients: state?.ingredient?.ingredients,
		getIngredientsAuth: state?.ingredient?.getIngredientsAuth,
		cave: state?.cave
	}
}
export default connect(mapStateToProps, { ingForBuyAndBake, beforeIngredient, getWalletData, beforeWalletData, rebakedPizza, beforeBakePizza })(PizzaCaveReBake);
