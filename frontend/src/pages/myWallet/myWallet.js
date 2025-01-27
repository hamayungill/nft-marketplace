import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ingForBuyAndBake, beforeIngredient } from '../../redux/Ingredients/Ingredient.action';
import { getWalletData, beforeWalletData } from '../../components/Wallet/Wallet.action';
import Loader from '../../components/loader/loader';
import { Container, Row, Col } from 'react-bootstrap';
import { Tabs, Tab } from 'react-bootstrap';
import { checkIngredientMints } from '../../utils/web3';
import PizzaWrapper from '../../components/pizzaWrapper/pizzaWrapper';
import Ingredient from '../../components/ingredient/ingredient';
import RarityPlaceholder from '../../assets/images/pizza-placeholder.png';
import './myWallet.css';
import { Redirect } from 'react-router-dom';

function MyWallet(props) {

    const [ingBase, setIngBase] = useState([])
    const [ingCheese, setIngCheese] = useState([])
    const [ingSauce, setIngSauce] = useState([])
    const [ingMeat, setIngMeat] = useState([])
    const [ingTopping, setIngTopping] = useState([])

    const [pizzaWithIng, setPizzaWithIng] = useState([])
    const [errIngMsg, setErrIngMsg] = useState(false)
    const [errPizzaMsg, setErrPizzaMsg] = useState(false)
    const [loader, setloader] = useState(true)
    const [pizzaloader, setPizzaLoader] = useState(true)
    const [userPizza, setUserPizza] = useState([])
    const [userIngredient, setUserIngredient] = useState([])

    const [isLoggedIn, setIsLoggedIn] = useState(true)

    useEffect(() => {
        setIsLoggedIn(props?.userAuth)
    }, [props?.userAuth])

    useEffect(() => {
        fetchByAndBakeIngredient()
    }, [])

    //default My Ingredients
    useEffect(() => {
        if (props?.user?._id) {
            props.beforeWalletData();
            props.getWalletData(props.user._id, 'ingredient')
        }
    }, [props?.user])


    //Ingredients
    useEffect(() => {
        if (props.getWalletIgredientAuth) {
            if (props.userIngredients.length > 0) {
                // setUserIngredient(props.userIngredients)
                let userIngredient = props.userIngredients
                if (userIngredient) {
                    let baseArr = [], cheese = [], sauce = [], meat = [], topping = []
                    for (let i = 0; i < userIngredient.length; i++) {
                        if (userIngredient[i].catType === 'base') {
                            baseArr.push(userIngredient[i])
                        }
                        else if (userIngredient[i].catType === 'sauce') {
                            sauce.push(userIngredient[i])
                        }
                        else if (userIngredient[i].catType === 'cheese') {
                            cheese.push(userIngredient[i])
                        }
                        else if (userIngredient[i].catType === 'meat') {
                            meat.push(userIngredient[i])
                        }
                        else if (userIngredient[i].catType === 'topping') {
                            topping.push(userIngredient[i])
                        }
                    }
                    prepareIngredientsData([baseArr, sauce, cheese, meat, topping])
                }
            }
            else {
                setErrIngMsg(true)
                setloader(false)
            }
        }
    }, [props.getWalletIgredientAuth])

    //userIngredient
    // useEffect(() => {
    //     if (userIngredient) {
    //         let baseArr = [], cheese = [], sauce = [], meat = [], topping = []
    //         for (let i = 0; i < userIngredient.length; i++) {
    //             if (userIngredient[i].catType === 'base') {
    //                 baseArr.push(userIngredient[i])
    //             }
    //             else if (userIngredient[i].catType === 'sauce') {
    //                 sauce.push(userIngredient[i])
    //             }
    //             else if (userIngredient[i].catType === 'cheese') {
    //                 cheese.push(userIngredient[i])
    //             }
    //             else if (userIngredient[i].catType === 'meat') {
    //                 meat.push(userIngredient[i])
    //             }
    //             else if (userIngredient[i].catType === 'topping') {
    //                 topping.push(userIngredient[i])
    //             }
    //         }
    //         prepareIngredientsData([baseArr, sauce, cheese, meat, topping])
    //     }
    // }, [userIngredient])

    //Pizza
    useEffect(() => {
        if (props.getWalletPizzaAuth) {
            setPizzaLoader(false)
            if (props.userPizzas.length) {
                setUserPizza(props.userPizzas)
            }
            else {
                setErrPizzaMsg(true)
            }
        }
    }, [props.getWalletPizzaAuth])

    //PizzaWithIng
    useEffect(() => {
        if (userPizza.length > 0) {
            let resIngPizza = []
            for (let i = 0; i < userPizza.length; i++) {
                const Pizza = userPizza[i]
                const IngredientsArr = userPizza[i].ingredients
                let result = null;
                let PizzaIng = []
                for (let j = 0; j < IngredientsArr.length; j++) {
                    result = props.buyAndBakeIngredients.filter(ing => ing._id === IngredientsArr[j])
                    PizzaIng.push(result[0])

                }
                resIngPizza.push({ pizza: Pizza, ingDetail: PizzaIng })
            }
            setPizzaWithIng(resIngPizza)
        }
    }, [userPizza])

    const prepareIngredientsData = async (ingredeintsArr) => {
        await prepareMintsData(ingredeintsArr)
        setloader(false)
    }

    const prepareMintsData = async (ingredientsArr) => {
        for (let l = 0; l < ingredientsArr.length; l++) {
            const allIngredientsData = []
            const ingredients = ingredientsArr[l];
            for (let index = 0; index < ingredients.length; index++) {
                const e = ingredients[index];
                const res = await callIngredientMints(e._ingredientId)
                e.minted = res.minted
                e.total = res.total
                allIngredientsData.push(e)
            }
            if (l === 0) {
                setIngBase(allIngredientsData)
            } else if (l === 1) {
                setIngSauce(allIngredientsData)
            } else if (l === 2) {
                setIngCheese(allIngredientsData)
            } else if (l === 3) {
                setIngMeat(allIngredientsData)
            } else if (l === 4) {
                setIngTopping(allIngredientsData)
            } else { }
        }
    }

    const callIngredientMints = async (ingredientId) => {
        let mints = await checkIngredientMints(ingredientId);
        return mints;
    }
    const fetchByAndBakeIngredient = () => {
        props.beforeIngredient()
        props.ingForBuyAndBake()
    }

    const replaceRightType = (type) => {
        if (type === 'ingredients') {
            setloader(true)
            walletData("ingredient")
        }
        if (type === 'pizzas') {
            setPizzaLoader(true)
            walletData('pizza',)
        }
    }

    const walletData = (type) => {
        if (props?.user?._id) {
            props.beforeWalletData();
            props.getWalletData(props?.user?._id, type)
        }
    }

    if (!isLoggedIn) {
        if (!props?.userAuth) {
            return (
                <Redirect to="/" />
            )
        }
    }

    return (
        <React.Fragment>
            <div className="my-wallet-section">
                <div className="my-wallet-head ff-lato">
                    <h2 className="red-color fw-bold mb-4">My Wallet</h2>
                    <p>A list of your ingredients and completed pizzas</p>
                </div>
                <div className="wallet-tabs">
                    <Tabs defaultActiveKey="ingredients" id="uncontrolled-tab-example" onSelect={(k) => replaceRightType(k)} className="mb-3">
                        <Tab eventKey="ingredients" title="My Ingredients">
                            {
                                loader ?
                                    <Loader />
                                    :
                                    <Container fluid>
                                        <Row>
                                            <Col md={12} className="p-0">

                                                <div className="ingredients-section">
                                                    {
                                                        ingBase.length > 0 ?
                                                            <div className="ingredients-head">
                                                                <span className="ff-lato red-color head">Base</span>
                                                            </div>
                                                            :
                                                            " "
                                                    }
                                                    {
                                                        ingBase &&
                                                        <Row>
                                                            {
                                                                ingBase && ingBase.map((item, index) => {
                                                                    return (
                                                                        <Col md={6}>
                                                                            <div key={index}>
                                                                                <Ingredient item={item} addButton={false} />
                                                                            </div>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                    }
                                                    {
                                                        ingSauce.length > 0 &&
                                                        <div className="ingredients-head">
                                                            <span className="ff-lato red-color head">Sauce</span>
                                                        </div>
                                                    }
                                                    {
                                                        ingSauce && 
                                                        <Row>
                                                            {
                                                                ingSauce && ingSauce.map((item, index) => {
                                                                    return (
                                                                        <Col md={6}>
                                                                            <div key={index}>
                                                                                <Ingredient item={item} addButton={false} />
                                                                            </div>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                        
                                                    }
                                                    {
                                                        ingCheese.length > 0 &&
                                                        <div className="ingredients-head">
                                                            <span className="ff-lato red-color head">cheese</span>
                                                        </div>
                                                    }
                                                    {
                                                        ingCheese && 
                                                        <Row>
                                                            {
                                                                ingCheese && ingCheese.map((item, index) => {
                                                                    return (
                                                                        <Col md={6}>
                                                                            <div key={index}>
                                                                                <Ingredient item={item} addButton={false} />
                                                                            </div>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                        
                                                    }
                                                    {
                                                        ingMeat.length > 0 &&
                                                        <div className="ingredients-head">
                                                            <span className="ff-lato red-color head">Meat</span>
                                                        </div>
                                                    }
                                                    {
                                                        ingMeat &&
                                                        <Row>
                                                            {
                                                                ingMeat && ingMeat.map((item, index) => {
                                                                    return (
                                                                        <Col md={6}>
                                                                            <div key={index}>
                                                                                <Ingredient item={item} addButton={false} />
                                                                            </div>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                    }
                                                    {
                                                        ingTopping.length > 0 &&
                                                        <div className="ingredients-head">
                                                            <span className="ff-lato red-color head">Topping</span>
                                                        </div>
                                                    }
                                                    {
                                                        ingTopping &&
                                                        <Row>
                                                            {
                                                                ingTopping && ingTopping.map((item, index) => {
                                                                    return (
                                                                        <Col md={6}>
                                                                            <div key={index}>
                                                                                <Ingredient item={item} addButton={false} />
                                                                            </div>
                                                                        </Col>
                                                                    )
                                                                })
                                                            }
                                                        </Row>
                                                    }

                                                    {/* If No ingredient Buy yet then show message for Empty ingredient */}
                                                    {
                                                        !loader ? errIngMsg && <div className="empty-box"><p>You do not have any Ingredient in your Wallet</p></div> : ""
                                                    }
                                                </div>

                                            </Col>
                                        </Row>
                                    </Container>
                            }
                        </Tab>
                        {/* Pizza type */}
                        <Tab eventKey="pizzas" title="My Pizzas">
                            {
                                pizzaloader ?
                                    <Loader />
                                    :
                                    <Container fluid>
                                        <div className="ingredients-section">
                                            <Row>

                                                {
                                                    pizzaWithIng && pizzaWithIng.map((item, index) => {
                                                        return (
                                                            <Col lg={6} className="">
                                                                <div key={index}>
                                                                    <PizzaWrapper image={item.pizza.imageCloudinaryUrl ? item.pizza.imageCloudinaryUrl : RarityPlaceholder} ingAll={item.ingDetail} rarity={item.pizza.rarity ? item.pizza.rarity : ""} bgcolor="#CC4443" color="#FFFFFF" />
                                                                </div>
                                                            </Col>
                                                        )
                                                    })
                                                }
                                                {/* Incase of Empty myPizzas */}
                                                {
                                                    !pizzaloader ? errPizzaMsg && <div className="empty-box"><p>You do not have any Pizza in your Wallet.</p></div> : ""
                                                }
                                            </Row>
                                        </div>
                                    </Container>
                            }
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </React.Fragment>
    )
}
const mapStateToProps = (state) => {
    return {
        buyAndBakeIngredients: state?.ingredient?.ingredients,
        getIngredientsAuth: state?.ingredient?.getIngredientsAuth,
        userIngredients: state.wallet.walletIngredients,
        getWalletIgredientAuth: state.wallet.getWalletIgredientsAuth,
        userPizzas: state.wallet.walletPizzas,
        getWalletPizzaAuth: state.wallet.getWalletPizzasAuth,
        user: state.user.userData,
        userAuth: state.user.userAuth,
    }
}
export default connect(mapStateToProps, { getWalletData, beforeWalletData, ingForBuyAndBake, beforeIngredient })(MyWallet);