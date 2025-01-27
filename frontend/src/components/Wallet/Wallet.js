import React ,{ useState , useEffect } from "react";
import { connectMetamask } from "../../utils/web3";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { setWalletAddress  } from "./Wallet.action";
import { login } from "../../redux/user/user.action";
import { Modal } from 'react-bootstrap';
import logoMetaMask from '../../assets/images/logo-meta-mask.svg';
import { useLocation } from 'react-router-dom';

const Wallet = (props)=>{
    const location = useLocation();
    const [accountAddress, setAccountAddress] = useState()
    
    //connectToMetaMask
    const walletConnection = async () =>{
        const address = await connectMetamask();
        setAccountAddress(address)
        props.setWalletAddress(address)
        onSignIn(address)
        props.onHide()
    }

    const onSignIn = async (address)=>{
        let data = { address }
        props.login(data)
    }
    
return(
    <>  {! accountAddress && 
        <Modal centered show={props.show} onHide={props.onHide} className="laszlo-modal connect-wallet-modal">
            <Modal.Body className="text-center">
                <h3 className="mb-4 ff-lato fw-900">Connect your Wallet</h3>
                <div className="wallet-icon-holder">
                <Link className="d-inline-block align-top" to={`${location?.pathname}${location?.hash && location?.hash}`}>
                    <img className="d-inline-block align-top" src={logoMetaMask}  onClick={()=> walletConnection() } alt="meta Mask Logo" />
                </Link>
                </div>
            </Modal.Body>
		</Modal>
        }
    </>
)
}
const mapStateToProps = state => ({
    wallet: state.wallet.accountAddress,
    error: state.error.error,
    user: state.user
})

export default connect(mapStateToProps , {setWalletAddress , login})(Wallet);