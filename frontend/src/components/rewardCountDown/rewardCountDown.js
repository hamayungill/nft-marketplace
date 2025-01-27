import React, { useEffect, useState } from "react";
import {ENV} from '../../config/config';
import {getCurrentBlockNumber, rewardToBeWon} from '../../utils/web3';
import './rewardCountDown.css'

const RewardCountDown = (props) => {

    const [blockNum, setBlockNum] = useState(0)
    const [rewardAmt, setRewardAmt] = useState(0)
    const [targetBlockNumber, setTargetBlockNumber] = useState(0)
    const [count, setCount] = useState(0)
    
    useEffect(()=> {
        callFn()
    })

    useEffect(()=> {
        setInterval(()=> {
            getBlockNumber()
        }, 15000)
    }, {})

    useEffect(()=> {
        if(count<1){
            callFn()            
        }
    }, [count])
    
    function leftFillNum(num, targetLength) {
        return num.toString().padStart(targetLength, 0);
    }

    const callFn = async() => {
        getRewardAmt()    
        await getTargetBlockNumber()
        await getBlockNumber()
        const c = await getCounts()
        setCount(c)
    }

    const getRewardAmt = async() => {
        const res = await rewardToBeWon()
        setRewardAmt(res)
    }
    
    const getBlockNumber  = async() => {
        const res = await getCurrentBlockNumber()
        setBlockNum(res)
    }

    const getTargetBlockNumber = () => {

        let url = `${ENV.url}block_number`
        fetch(url, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            }
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setTargetBlockNumber(data?.data?.targetBlockNumber)
                return true
            } else {
                return false
            }
        }).catch(error => {
            if (error.response && error.response.data) {
                const { data } = error.response
                if (data.message)
                    console.log(data.message)
            }
        })
    }

    const getCounts = () => {
        let num = targetBlockNumber - blockNum 
        let fourDigitNum = leftFillNum(num, 4)
        return fourDigitNum
    }

    return (
        <div className="rewardcountdown-block d-lg-flex">
            <div className="rewardcountdown-block-p me-lg-3"><p>Reward to be Won: <span> {rewardAmt || 0} {ENV.appCurrency}</span></p></div>
            <div className="rewardcountdown-block-p"><p>Block Number: <span>{count}</span></p></div>
        </div>
    )
}

export default RewardCountDown