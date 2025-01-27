import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SelectIngredient from '../selectIngredient/selectIngredient';
import CheckRarity from '../checkRarity/checkRarity';
import tableCloth from '../../assets/images/tablecloth.svg';
import { ingForBuyAndBake, beforeIngredient } from '../../redux/Ingredients/Ingredient.action';
import { ENV } from '../../config/config';
import { randomMintNBakePizza } from '../../utils/web3';
import TransactionModal from '../transactionModal/transactionModal';
import { toPng } from 'html-to-image';
import { beforeBakePizza, randomBakePizza } from '../../redux/cave/cave.action'
import { getWalletData, beforeWalletData } from '../Wallet/Wallet.action';
import Wallet from '../Wallet/Wallet';
import RarityTooltip from '../rarityTooltip/rarityTooltip';
function PizzaCaveBake(props) {

	// for validation
	const { baseMin, sauceMin, cheeseMin, meatMin, toppingMin } = ENV

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

	// pizza ingredients
	const [pizzaIngredients, setPizzaIngredients] = useState([])

	// transactions
	const [showTxBakePizza, setShowTxBakePizza] = useState(false)

	const [txBakePizza, setTxBakePizza] = useState(false)
	const [txBakePizzaState, setTxBakePizzaState] = useState(0)
	const [txBakePizzaError, setTxBakePizzaError] = useState(null)

	// mintedIds
	//baseId, sauceId, cheeseId, meatId, toppingId
	const [baseId, setBaseId] = useState([])
	const [sauceId, setSauceId] = useState([])
	const [cheeseId, setCheeseId] = useState([])
	const [meatId, setMeatId] = useState([])
	const [toppingId, setToppingId] = useState([])

	const [show, setShow] = useState(false);
	const [userAuth, setUserAuth] = useState()

	//Authentication from localStorage
	useEffect(() => {
		setUserAuth(props.userAuth)
	}, [props.userAuth])

	const handleClose = () => setShow(false);

	useEffect(() => {
		if (props?.user) {
			setLoaderIng(true)
			setErrMsgIng(false)
			props.beforeWalletData()
			props.getWalletData(props?.user?._id, "ingredient")
		} else {
			setErrMsgIng(true)
			// setLoaderIng(false)
			props.beforeWalletData()
		}
	}, [props?.user])

	useEffect(() => {
		if (props.getWalletIgredientsAuth) {
			setLoaderIng(false)
			if (props.ingredients?.length > 0) {
				console.log("props.ingredients?.lengthprops.ingredients?.lengthprops.ingredients?.length")
				console.log(props.ingredients)
				setwalletIngredients([...props.ingredients])
			} else {
				setErrMsgIng(true)
				console.log("settting empty")
				let arr = []
				setwalletIngredients([...arr])
			}
		} else {
			setwalletIngredients([])
		}
	}, [props.getWalletIgredientsAuth])

	const sortIng = (ing) => {
		const sorted = ing?.sort((a, b) => a.layerNum - b.layerNum)
		setPizzaIngredients([...sorted])
	}
	useEffect(() => {
		sortIng([...selectedBase, ...selectedSauce, ...selectedCheese, ...selectedMeats, ...selectedToppings])
	}, [selectedBase, selectedSauce, selectedCheese, selectedMeats, selectedToppings])

	useEffect(() => {
		if (props.cave.randomPizzaAuth) {
			if (props.cave.randomPizza.success) {
				let pizzaData = props.cave.randomPizza.data
				const { contentIpfs, _id, ingredients } = pizzaData
				if (props.user) {
					bakePizzaFn(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, props.user._id, ingredients)
				}
			}
		}
	}, [props.cave.randomPizzaAuth])

	useEffect(() => {
		if (txBakePizza) {
			bakePizza()
			setTxBakePizzaState(1)
		}
	}, [txBakePizza])

	const bakePizzaFn = async (_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, ingredients) => {

		if (userID) {
			let price = parseFloat(ENV.bakeFee)

			// calling the web3 fn which is used for random bake and buy and bake 
			const res = await randomMintNBakePizza(_id, contentIpfs, baseId, sauceId, cheeseId, meatId, toppingId, userID, "bakeAndMint", price, ingredients)
			if (res) {
				setSelectedBase([])
				setSelectedSauce([])
				setSelectedCheese([])
				setSelectedMeats([])
				setSelectedToppings([])
				setPizzaIngredients([])
				props.beforeBakePizza()
				setTxBakePizzaState(3)
				setLoaderIng(true)
				setErrMsgIng(false)
				props.beforeBakePizza()
				props.beforeWalletData()
				props.getWalletData(props?.user?._id, "ingredient")
			} else {
				props.beforeBakePizza()
				setTxBakePizzaState(2)
			}
		}
	}

	// buy and bake pizza
	const bakePizza = async () => {
		props.beforeBakePizza()
		callBakePizzaAPI()
	}

	// buy and bake pizza api call
	const callBakePizzaAPI = async (e) => {

		let ingredientIDsArr = []
		let price = 0

		// checks to bake pizza
		let baseId = []
		let sauceId = []
		let cheeseId = []
		let meatId = []
		let toppingId = []

		Promise.all(pizzaIngredients.map(async (e) => {
			console.log("hello ba", e.id)
			ingredientIDsArr.push(e.id)
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
			setTxBakePizzaError(errMsg)
			setTxBakePizzaState(2)
			return
		}

		// set the state for minted ids
		setBaseId(baseId)
		setSauceId(sauceId)
		setCheeseId(cheeseId)
		setMeatId(meatId)
		setToppingId(toppingId)

		// htmt to png
		toPng(document.getElementById("bakePizzaNode"), { cacheBust: true, })
			.then((dataUrl) => {
				let pizzaData = { isActive: true }
				pizzaData["image"] = dataUrl
				pizzaData["currentOwnerId"] = props.user._id
				pizzaData["creatorId"] = props.user._id
				pizzaData["ingredientIds"] = ingredientIDsArr

				props.randomBakePizza(pizzaData, "bakeAndMint")

				console.log("calling bake pizza")

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

	return (
		<React.Fragment>
			<div className="tab-detail">
				<h2 className="ff-lato fw-bold red-color mb-4">Bake a Pizza</h2>
				<div className="page-description ff-lato">
					<p>Bake a pizzza with ingredients you already have in your wallet. {ENV.bakeFee} {ENV.appCurrency} Baking fee.</p>
				</div>
			</div>
			<Container fluid className="cave-section">
				<Row className="row-left-right">
					<Col lg={6} className="left-col d-none d-lg-block">
						{props?.userAuth ? <SelectIngredient forComponent="onlyBake" loader={loaderIng} errMsg={errMsgIng} buyAndBakeIngredients={walletIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} /> : <div className='ingredient-col'><div class="d-flex justify-content-between align-items-center mb-4 mb-md-5"><span class="ingredients-heading-text ff-lato red-color">My Ingredients</span></div><div className="connect-wallet"><p onClick={() => { setShow(true) }}>Please connect to wallet</p></div></div>}
					</Col>
					<Col lg={6} className="right-col">
						<div className="pizza-col">
							<Tabs defaultActiveKey="yourSelection" id="uncontrolled-tab-example2" className="justify-content-center pizza-tabs">
								{
									window.matchMedia('(max-width:991px)').matches ?
										<Tab eventKey="ingredients" title="Ingredients">
											{
												props?.userAuth ? <SelectIngredient forComponent="onlyBake" loader={loaderIng} errMsg={errMsgIng} buyAndBakeIngredients={walletIngredients} selectedBase={selectedBase} selectedSauce={selectedSauce} selectedCheese={selectedCheese} selectedMeats={selectedMeats} selectedToppings={selectedToppings} setSelectedBase={setSelectedBase} setSelectedSauce={setSelectedSauce} setSelectedCheese={setSelectedCheese} setSelectedMeats={setSelectedMeats} setSelectedToppings={setSelectedToppings} /> : <div className='ingredient-col'><div class="d-flex justify-content-between align-items-center mb-4 mb-md-5"><span class="ingredients-heading-text ff-lato red-color">My Ingredients</span></div><div className="connect-wallet"><p onClick={() => { setShow(true) }}>Please connect to wallet</p></div></div>
											}
										</Tab> : ''
								}

								<Tab eventKey="yourSelection" title="Your Selection">
									<div className="pizza-making-block d-flex justify-content-center">
										<div className="table-cloth-image" id="bakePizzaNode">
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
										<button className="btn-red-outline transition d-block w-100 mb-3" disabled={pizzaIngredients.length > 0 && props.user?._id ? false : true} onClick={() => { setShowTxBakePizza(true); setTxBakePizzaState(0) }}>Bake ({parseFloat(ENV?.bakeFee)} {ENV.appCurrency})</button>
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
				showTxBakePizza && <TransactionModal setShow={setShowTxBakePizza} tx={setTxBakePizza} txState={txBakePizzaState} customError={txBakePizzaError} />
			}
			{
				!userAuth &&
				<Wallet setUserAuth={setUserAuth} show={show} onHide={handleClose} />
			}
		</React.Fragment>
	);
}

const mapStateToProps = (state) => {
	return {
		buyAndBakeIngredients: state?.ingredient?.ingredients,
		ingredients: state?.wallet?.walletIngredients,
		getWalletIgredientsAuth: state?.wallet?.getWalletIgredientsAuth,
		user: state?.user?.userData,
		userAuth: state?.user?.userAuth,
		cave: state.cave,
	}
}

export default connect(mapStateToProps, { getWalletData, beforeWalletData, ingForBuyAndBake, beforeIngredient, beforeBakePizza, randomBakePizza })(PizzaCaveBake);
