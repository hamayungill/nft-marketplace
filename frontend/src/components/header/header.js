import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from "react-router-dom";
import { ENV } from '../../config/config';
import Wallet from '../Wallet/Wallet';
import { disconnectUser, setUser } from '../../redux/user/user.action';
import { setWalletAddress, beforeWalletData } from '../Wallet/Wallet.action';
import { Container, Navbar, Dropdown } from 'react-bootstrap';
import siteLogo from '../../assets/images/logo.svg';
import './header.css';
import { beforeBakePizza } from '../../redux/cave/cave.action'
import ClaimRewardModal from '../claimRewardModal/claimRewardModal';

function Header(props) {
	const [userAuth, setUserAuth] = useState()
	const [wallet, setWallet] = useState()

	// const history = useHistory() 
	const location = useLocation();
	const pathname = location.pathname
	const [show, setShow] = useState(false);

	const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

	const logicToAddress = () => {
		let { address } = ENV.getUserKeys("address")
		if (address) {
			props.setWalletAddress(address)
		}
		if (ENV.getUserKeys("userAuth").userAuth) {
			const userData = ENV.getUserKeys("_id email address accessToken userAuth")
			props.setUser(userData)
		}
	}

	useEffect(() => {
		// store the user in localstorage
		if (props.userAuth) {
			let obj = props.user
			obj["userAuth"] = props.userAuth
			ENV.encryptUserData(obj)
		}
	}, [props.userAuth])

	useEffect(() => {
		logicToAddress()
	}, [])

	//get Wallet
	useEffect(() => {
		setWallet(props.wallet)
	}, [props.wallet])

	//Authentication from localStorage
	useEffect(() => {
		setUserAuth(props.userAuth)
	}, [props.userAuth])

	const formattedAddress = (address) => {
		return `${address.slice(0, 5)}...${address.slice(-5)}`
	}
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const disConnectApp = async () => {
		props.disconnectUser()
		props.setWalletAddress(null)
		props.beforeWalletData()
		props.beforeBakePizza()
	}

	return (
		<React.Fragment>
			<header id="header">
				<Container fluid className="px-0">
					<div className="d-flex">
						<strong className="logo d-inline-block align-top">
							<Link className="d-block" to="/">
								<img className="img-fluid" src={siteLogo} alt="Site Logo" />
							</Link>
						</strong>
						<div className="nav-holder position-relative  flex-fill">
							<strong className="site-name ff-press-start">{ENV.appName}</strong>
							<Navbar expand="lg">
								<Navbar.Toggle aria-controls="basic-navbar-nav" />
								<Navbar.Collapse id="basic-navbar-nav">
									<ul className="navbar-nav ff-lato fw-900">
										<li className={`nav-item ${pathname === '/' ? 'active' : ''}`}><Link className="nav-link position-relative" to="/">Home </Link></li>
										<li className={`nav-item ${pathname === '/pizza-cave' ? 'active' : ''}`}><Link className="nav-link position-relative" to="/pizza-cave">Pizza Cave</Link></li>
										<li className={`nav-item ${pathname === '/meet-artists' ? 'active' : ''}`}><Link className="nav-link position-relative" to="/meet-artists">Meet Artists</Link></li>
										<li className={`nav-item ${pathname === '/rarity-rewards' ? 'active' : ''}`}><Link className="nav-link position-relative" to="/rarity-rewards">Rarity Rewards</Link></li>
										{wallet && <li className={`nav-item ${pathname === '/my-wallet' ? 'active' : ''}`}><Link className="nav-link position-relative" to="/my-wallet">My Wallet</Link></li>}
									</ul>
									{
										wallet && userAuth ?
											<div >
												<Dropdown className='cwallet-dropdown'>
													<Dropdown.Toggle id="dropdown-basic" className="btn btn-yellow">
														<span className="wallet-dropdown">{formattedAddress(wallet)}</span>
													</Dropdown.Toggle>

													<Dropdown.Menu>
														<Dropdown.Item onClick={() => { disConnectApp() }}>DISCONNECT</Dropdown.Item>

													</Dropdown.Menu>
												</Dropdown>
												<button className="btn-yellow-outline claim-button" onClick={() => { setShowClaimRewardModal(true) }}>Claim Reward</button>
											</div>
											: <button to="connect-wallet" className="btn-yellow ff-lato fw-900 transition btn-cnct-wall d-inline-block align-top" onClick={handleShow}>Connect Wallet</button>
									}
								</Navbar.Collapse>
							</Navbar>
						</div>
					</div>
				</Container>
			</header>
			{
				!userAuth &&
				<Wallet setUserAuth={setUserAuth} show={show} onHide={handleClose} />
			}
			{
				showClaimRewardModal && <ClaimRewardModal walletAddress={wallet} show={showClaimRewardModal} setShow={setShowClaimRewardModal} />
			}
		</React.Fragment>
	);
}
const mapStateToProps = state => ({
	user: state.user.userData,
	userAuth: state.user.userAuth,
	wallet: state.wallet.accountAddress
})
export default connect(mapStateToProps, { disconnectUser, setWalletAddress, beforeWalletData, setUser, beforeBakePizza })(Header);