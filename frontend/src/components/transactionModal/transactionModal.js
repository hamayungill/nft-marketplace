import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Loader from '../loader/loader';

// 0- confirmation 
// 1- progress
// 2- fail
// 3- success

const TransactionModal = (props) => {
    const { txState, tx, setShow, customError } = props
    
    return (
        <Modal centered show={true} className="laszlo-modal">
            <Modal.Body className="text-center">
                <h3 className="mb-4 ff-lato fw-900">
                {txState === 0 ? "Are you Sure?" : txState === 1 ? "Transaction in progress." : txState === 2 ? `${customError ? customError : "Transaction Failed!"}` : txState === 3 ? <span className="text-yellow">Transaction Successfull!</span> : "Something's going wrong!"}
                </h3>
                {
                    txState === 1 && <span className="transaction-loader"><Loader /></span>
                }
            </Modal.Body>
            <Modal.Footer>
                {
                    txState === 0 ? 
                    <>
                        <Button variant="primary" onClick={() => tx(true)}>
                            Proceed
                        </Button>
                        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                    </>
                    : txState === 1 ?
                    <>
                    </> 
                    : txState === 2 || txState === 3 ?
                    <>
                        <Button variant="secondary" onClick={() => {setShow(false); tx(false)}}>Close</Button>
                    </> : <></>
                }
            </Modal.Footer>
        </Modal>
    )
}

export default TransactionModal