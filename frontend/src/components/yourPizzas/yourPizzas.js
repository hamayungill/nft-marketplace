import React, { useEffect, useState } from 'react';
import BakedPizza from '../bakedPizza/bakedPizza';
import './yourPizzas.css';
import Loader from '../loader/loader';
import { connect } from 'react-redux';
import Wallet from '../Wallet/Wallet';

function YourPizzas(props) {

	const { bakedPizzas, loader, errMsg, setSelectedPizza, selectedPizza, forComponent} = props

	console.log("errMsg, loader")
	console.log(errMsg, loader)

	const [show, setShow] = useState(false);
	const [userAuth, setUserAuth] = useState()

	//Authentication from localStorage
	useEffect(() => {
		setUserAuth(props.userAuth)
	}, [props.userAuth])

	const handleClose = () => setShow(false);

	return (
		<div className="ingredient-col">
			{
				forComponent !== "rebake" &&  
					<div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
						<span className="ingredients-heading-text ff-lato">Your Pizzas</span>
					</div>
			}
			{
				loader ?
					<div className="d-flex justify-content-center align-items-center mt-5">
						<Loader />
					</div>
					:
					bakedPizzas && bakedPizzas.map((e, index) => {
						return (
							<div key={index}>
								<BakedPizza pizza={e} setSelectedPizza={setSelectedPizza} selectedPizza={selectedPizza} />
							</div>
						)
					})
			}
			{
				(errMsg && !userAuth) ?
					<div className="connect-wallet"><p onClick={() => { setShow(true) }}>Please connect to wallet</p></div>
					: (!loader && errMsg) ? <div className="empty-box"><p>No Pizza Baked Yet.</p></div> : ''
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
		user: state?.user?.userData,
		userAuth: state.user.userAuth,
	}
}

export default connect(mapStateToProps, {})(YourPizzas);