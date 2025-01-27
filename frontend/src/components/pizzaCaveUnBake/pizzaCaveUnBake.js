import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Row, Col } from 'react-bootstrap';
import YourPizzas from '../yourPizzas/yourPizzas';
import CheckRarity from '../checkRarity/checkRarity';
import { connect } from 'react-redux';
import { getWalletData, beforeWalletData } from '../Wallet/Wallet.action';
import { ENV } from '../../config/config';
import tableCloth from '../../assets/images/tablecloth.svg';
import { UnbakeBakePizza } from '../../utils/web3'
import TransactionModal from '../transactionModal/transactionModal';
import RarityTooltip from '../rarityTooltip/rarityTooltip';
import { ingForBuyAndBake, beforeIngredient } from '../../redux/Ingredients/Ingredient.action';

function PizzaCaveUnBake(props) {

	const [pizzas, setPizzas] = useState(null)
	const [loader, setLoader] = useState(true)
	const [errMsg, setErrMsg] = useState(false)

	// pizza ingredients
	const [ingPizza, setIngPizza] = useState([])

	// selected pizza
	const [selectedPizza, setSelectedPizza] = useState(null)

	// unbake tx 
	const [showTxUnbakePizza, setShowTxUnbakePizza] = useState(false)

	const [txUnbakePizza, setTxUnbakePizza] = useState(false)
	const [txUnbakePizzaState, setTxUnbakePizzaState] = useState(0)
	const [txUnbakePizzaError, setTxUnbakePizzaError] = useState(null)

	useEffect(() => {
		props.ingForBuyAndBake()
	}, [])

	useEffect(() => {
		props.beforeWalletData()
		if (props?.userAuth) {
			props.getWalletData(props?.user?._id, "pizza")
			setErrMsg(false)
			setLoader(true)
		} else {
			setErrMsg(true)
			setLoader(false)
			setPizzas(null)
			setSelectedPizza(null)
			setIngPizza([])
		}
	}, [props?.user])

	useEffect(() => {
		if (props.getBakedPizzaAuth) {
			setLoader(false)
			if (props.bakedPizzas.length > 0) {
				setPizzas(props.bakedPizzas)
				setErrMsg(false)
			} else {
				setErrMsg(true)
			}
		}
	}, [props.getBakedPizzaAuth])

	useEffect(() => {
		if (selectedPizza?.ingredients && selectedPizza?.ingArray) {
			let res = selectedPizza?.ingArray
			setIngPizza(res)
		}
		if (selectedPizza === null) {
			setIngPizza([])
		}
	}, [selectedPizza])

	useEffect(() => {
		if (txUnbakePizza) {
			unbakePizza()
			setTxUnbakePizzaState(1)
		}
	}, [txUnbakePizza])

	const unbakePizza = async () => {
		let ingIds = []
		let id = selectedPizza?._pizzaId
		Promise.all(selectedPizza?.ingArray?.map((ing) => {
			ingIds.push(ing?._ingredientId)
		}))
		const res = await UnbakeBakePizza(id, ingIds, selectedPizza?._id)
		if (res) {
			setTxUnbakePizzaState(3)
			setSelectedPizza(null)
			setIngPizza([])
			props.beforeWalletData()
			props.getWalletData(props?.user?._id, "pizza")
			setPizzas(null)
			setErrMsg(false)
			setLoader(true)
		} else {
			setTxUnbakePizzaState(2)
		}
	}

	return (
		<React.Fragment>
			<div className="tab-detail">
				<h2 className="ff-lato fw-bold red-color mb-4">Unbake Pizza ({ENV.unbakeFee} {ENV.appCurrency})</h2>
				<div className="page-description ff-lato">
					<p>Disassemble a pizza held in your wallet and return the constituent fresh ingredient NFTs to your wallet for trading or baking new pizzas.</p>
				</div>
			</div>
			<Container fluid className="cave-section">
				<Row className="row-left-right">
					<Col lg={6} className="left-col d-none d-lg-block">
						<YourPizzas bakedPizzas={pizzas} loader={loader} errMsg={errMsg} setSelectedPizza={setSelectedPizza} selectedPizza={selectedPizza} />
					</Col>
					<Col lg={6} className="right-col">
						<div className="pizza-col">
							<Tabs defaultActiveKey="yourSelection" id="uncontrolled-tab-example2" className="justify-content-center pizza-tabs">
								{
									window.matchMedia('(max-width:991px)').matches ?
										<Tab eventKey="yourPizzas" title="Your Pizzas">
											<YourPizzas bakedPizzas={pizzas} loader={loader} errMsg={errMsg} setSelectedPizza={setSelectedPizza} selectedPizza={selectedPizza} />
										</Tab> : ''
								}
								<Tab eventKey="yourSelection" title="Your Selection">
									<div className="pizza-making-block d-flex justify-content-center">
										<div className="table-cloth-image">
											<img className="img-fluid" src={selectedPizza?.imageCloudinaryUrl ? selectedPizza?.imageCloudinaryUrl : tableCloth} alt="Table Cloth Iage" />
										</div>
									</div>
									<div className="added-ingredients">
										<div className="d-flex justify-content-between mb-5 ff-lato fw-bold text-center">
											<span className="igredient-text unbake-text">Unbaking a Pizza will return all ingredients to your wallet</span>
										</div>
										<ul className="list-unstyled ingredients-list ff-press-start mb-5">
											{
												ingPizza?.map((item, index) => {
													return (
														<li className="d-flex justify-content-between" key={index}>
															<span className="ingredient-name">{ENV.capitalizeFirstLetter(item?.name)}</span>
														</li>
													)
												})
											}
										</ul>
										<button className="btn-red-outline transition d-block w-100 mb-3" disabled={!selectedPizza && "disabled"} onClick={() => { setShowTxUnbakePizza(true); setTxUnbakePizzaState(0) }}>Unbake Pizza ({ENV.unbakeFee} {ENV.appCurrency})</button>
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
				showTxUnbakePizza && <TransactionModal setShow={setShowTxUnbakePizza} tx={setTxUnbakePizza} txState={txUnbakePizzaState} customError={txUnbakePizzaError} />
			}
		</React.Fragment>
	);
}
const mapStateToProps = (state) => {
	return {
		bakedPizzas: state.wallet?.walletPizzas,
		getBakedPizzaAuth: state.wallet?.getWalletPizzasAuth,
		user: state?.user?.userData,
		userAuth: state.user.userAuth,
	}
}
export default connect(mapStateToProps, { beforeWalletData, getWalletData, ingForBuyAndBake, beforeIngredient })(PizzaCaveUnBake);
