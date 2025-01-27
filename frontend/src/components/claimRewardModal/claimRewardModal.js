import React, {useState, useEffect} from 'react'
import { Modal, Button } from 'react-bootstrap';
import Loader from '../loader/loader';
import { claimReward , getClaimRewardAmount, weitoEth} from '../../utils/web3';

const ClaimRewardModal = (props) => {
    const {show, setShow, walletAddress} = props
    const [claimableAmount, setClaimableAmount] = useState()
    const [claimedTx, setClaimedTx] = useState(false)
    const [loader, setLoader] = useState(true)
    const [txLoader, setTxLoader] = useState(false)
    const [txErrMsg, setTxErrMsg] = useState(null)
    
    useEffect(()=> {
        getClaimableAmount()
    }, [])

    const getClaimableAmount = async() => {
        console.log("calling")
        console.log("walletwalletwalletwallet",walletAddress)
        if(walletAddress){
            let res = await getClaimRewardAmount(walletAddress)
            let amount = await weitoEth(res)
            setClaimableAmount(amount)
            setLoader(false)
        }
    }

    const claimFn = async() => {
        setTxErrMsg(null)
        if(claimableAmount > 0 ){
            const res = await claimReward()
            if(res){
                setClaimedTx(true)
                setTxLoader(false)
                setClaimableAmount(0)
            }else {
                setTxLoader(false)
                setTxErrMsg("Transaction Failed!")
                setClaimedTx(false)
            }
        }
    }

    return(
        <Modal centered show={show} className="laszlo-modal">
            <Modal.Body className="text-center">
                {
                    loader ? <span className="yellow-loader"><Loader /></span>: 
                    <>
                        <h3 className="mb-4 ff-lato fw-900">
                            Claimable Reward Amount : { claimableAmount }
                        </h3>
                        {claimedTx && <p className="text-center text-yellow"> You have Successfully claimed your reward!</p>}
                        {(txErrMsg && !claimedTx) ?  <p className="text-center text-white">{txErrMsg}</p>: "" }
                    </>
                }
            </Modal.Body>
            <Modal.Footer>
                {
                    claimableAmount > 0 &&  
                    <Button variant="primary" className="claim-button" onClick={() => {setTxLoader(true); claimFn()}}>Claim Now 
                        {
                            txLoader && <span className="claim-loader"><Loader /></span>
                        }
                    </Button>
                }
                <Button variant="secondary" onClick={() => {setShow(false)}}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ClaimRewardModal