import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import RaityWrapper from '../../components/rarityWrapper/rarityWrapper';
// import RarityPlaceholder from '../../assets/images/pizza-placeholder.png';
import './rarityRewards.css';
import { getRarityRewardPizza, weitoEth, getTotalRarityRewards } from '../../utils/web3'
import Loader from '../../components/loader/loader';
import { ENV } from '../../config/config';
import RewardCountDown from '../../components/rewardCountDown/rewardCountDown';
import { getBakedPizzas, beforeBakePizza } from '../../redux/cave/cave.action'
import { connect } from 'react-redux';

function RarityRewards(props) {

    const [pervWinners, setPervWinners] = useState([])
    const [topTenPizza, setTop10Pizza] = useState([])
    const [currentWinner, setCurrentWinner] = useState(null)
    
    const [loader, setLoader] = useState(false)
    const [loaderCurrent, setLoaderCurrent] = useState(false)
    const [selectedTab, setSelectedTab] = useState("previous")

    useEffect(() => {
        if(selectedTab === "currentWinning" || selectedTab === "current"){
            setLoaderCurrent(true);
            setCurrentWinner(null)
            props.beforeBakePizza()
            props.getBakedPizzas()
        }
    }, [selectedTab])

    useEffect(()=> {
        if(props.getBakedPizzaAuth){
            if(props.bakedPizzas.length){
                setCurrentWinner(props.bakedPizzas[0])
                setTop10Pizza([...props.bakedPizzas])
            }
            setLoaderCurrent(false)
        }
    }, [props.getBakedPizzaAuth])

    useEffect(() => {
        // when tab change then again rare pizza call...
        getRarePizzas()
    }, [selectedTab === 'previous'])

    const getRarePizzas = async () => {
        setLoader(true);
        const pizzas = []

        const totalRarityRewardPizzas = await getTotalRarityRewards()
        for (let index = 0; index < totalRarityRewardPizzas; index++) {
            const pizza = await getRarityRewardPizza(index)
            if (pizza.nftId !== "0") {
                let price = await weitoEth(pizza?.price)
                let rarityScore = await weitoEth(pizza?.rarityScore)
                let rewardPrice = await weitoEth(pizza?.rewardPrice)
                let p_obj = {
                    claimed: pizza?.claimed,
                    nftId: pizza?.nftId,
                    price,
                    rarityScore,
                    rewardPrice,
                    wallet: pizza?.wallet,
                    image: pizza?.imageUrl
                }
                pizzas.push(p_obj)
            }
        }
        let sortedPizza = pizzas?.sort((a,b)=> a.rarityScore - b.rarityScore)
        setPervWinners([...sortedPizza])
        setLoader(false)
    }

    return (
        <React.Fragment>
            <div className="rarity-rewards-section">
                <div className="rarity-rewards-head ff-lato">
                    <div className='d-flex justify-content-between align-items-center rarity-rewards-head-content'>
                        <h2 className="red-color fw-bold mb-4">Rarity Rewards</h2>
                        <RewardCountDown />
                    </div>
                    <p>Rarity Rewards are awarded to the holder of the pizza that achieved the lowest Rarity Score in a Rewards Cycle. <span className='red-color'>A Reward Cycle lasts 10,000 blocks on the Ethereum blockchain.</span> The address of the holder of the rarest pizza at every block is calculated and recorded off-chain. At the end of the Reward Cycle 1% of the ETH available* in the {ENV.appName} smart contract is made claimable to the winner by clicking on the Claim button at the top of this page. Making further changes to a pizza after achieving the lowest rarity score does not invalidate a previously achieved score. Users may, therefore, continue to customize their pizza if they wish to improve their rarity score. at any time in a Reward Cycle without invalidating a previous rarity score. </p>
                    <p>Below you can view previous winning pizzas and associated rarity scores, as well as the best rarity score in the current reward cycle.</p>
                    <p>(*Rarity Reward = the available ETH balance held in the smart contract minus any unclaimed rewards and developer allowances.)</p>
                </div>
                <div className="rarity-tabs">
                    {/* Current Winning Pizza;  Current Top 10 Pizzas; Previous Winners. */}
                    <div>
                    <Tabs defaultActiveKey="previous" id="uncontrolled-tab-example" className="mb-3" onSelect={(k) => {setSelectedTab(k) }}>
                        <Tab eventKey="currentWinning" title="Current Winning Pizza">
                            {loaderCurrent ? <Loader /> :
                                <Container fluid>
                                    <Row>
                                        {
                                            currentWinner && 
                                                <Col md={12} className="p-0">
                                                    <div className="ingredients-section">
                                                        <RaityWrapper image={currentWinner ?.imageCloudinaryUrl} nftId={currentWinner?._pizzaId} rarityScore={currentWinner?.rarity}  bgcolor="#CC4443" color="#FFFFFF" userDate={false} id= "Opensea User Id"/>
                                                    </div>
                                                </Col>
                                        }
                                        {
                                            (!loaderCurrent && props.bakedPizzas.length > 0) ? "" : <div className="ingredients-section"> <div className="empty-box"><p>No Pizza Exist.</p></div> </div>
                                        }
                                    </Row>
                                </Container>
                            }
                        </Tab>
                        <Tab eventKey="current" title="Top 10 Pizzas">
                            {loaderCurrent ? <Loader /> :
                                <Container fluid>
                                    <Row>
                                        {
                                            topTenPizza.map((e, index) => {
                                                return (
                                                    <Col md={12} className="p-0">
                                                        <div className="ingredients-section">
                                                            <RaityWrapper image={e ?.imageCloudinaryUrl} nftId={e?._pizzaId} rarityScore={e?.rarity}  bgcolor="#CC4443" color="#FFFFFF" userDate={false} id= "Opensea User Id"/>
                                                        </div>
                                                    </Col>
                                                )
                                            })
                                        }
                                        {
                                            (!loaderCurrent && topTenPizza.length > 0) ? "" : <div className="ingredients-section"> <div className="empty-box"><p>No Pizza Exist.</p></div> </div>
                                        }
                                    </Row>
                                </Container>
                            }
                        </Tab>
                        <Tab eventKey="previous" title="Previous Winners">
                            {loader ? <Loader /> :
                                <Container fluid>
                                    <Row>
                                        {
                                            pervWinners.map((e, index) => {
                                                return (
                                                    <Col md={6} className="p-0" key={index}>
                                                        <div className="ingredients-section">
                                                            <RaityWrapper image={e?.image} nftId={e?.nftId} rarityScore={e?.rarityScore} rewardPrice={e?.price} bgcolor="#FFDA54" color="#3D3431" userDate={true} />
                                                        </div>
                                                    </Col>
                                                )
                                            })
                                        }
                                        {
                                            pervWinners.length > 0 ? "" : <div className="ingredients-section"> <div className="empty-box"><p>No Pizza Exist.</p></div> </div>
                                        }
                                    </Row>
                                </Container>
                            }
                        </Tab>
                    </Tabs>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        bakedPizzas: state?.cave?.bakedPizzas, 
        getBakedPizzaAuth: state?.cave?.getBakedPizzaAuth
    }
}

export default connect( mapStateToProps, { getBakedPizzas, beforeBakePizza })(RarityRewards);