import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IngredientBlock from '../ingredientBlock/ingredientBlock';
import './selectIngredient.css';
import { checkIngredientMints } from '../../utils/web3';
import Loader from '../loader/loader';
import TransactionModal from '../transactionModal/transactionModal';
import { ENV } from '../../config/config';

function SelectIngredient(props) {

	const { errMsg, buyAndBakeIngredients, setSelectedBase, setSelectedSauce, setSelectedCheese, setSelectedMeats, setSelectedToppings, selectedBase, selectedSauce, selectedCheese, selectedMeats, selectedToppings, forComponent, ingPizza, setIngPizza } = props

	const [ingBase, setIngBase] = useState(null)
	const [ingCheese, setIngCheese] = useState(null)
	const [ingSauce, setIngSauce] = useState(null)
	const [ingMeat, setIngMeat] = useState(null)
	const [ingTopping, setIngTopping] = useState(null)
	const [loader, setLoader] = useState(props?.loader)

	// const [baseMax, setBaseMax] = useState(1)
	// const [sauceMax, setSauceMax] = useState(1)
	// const [cheeseMin, setCheeseMin] = useState(1)
	// const [cheeseMax, setCheeseMax] = useState(1000)
	// const [meatMax, setMeatMax] = useState(4)
	// const [toppingMax, setToppingMax] = useState(4)
	const { cheeseMin, baseMax,sauceMax, cheeseMax, meatMax, toppingMax } = ENV

	// transactions
	const [showTx, setShowTx] = useState(false)
	const [tx, setTx] = useState(false)
	const [txState, setTxState] = useState(0)
	const [txError, setTxError] = useState('')

	const [ingBaseCount, setIngBaseCount] = useState(0)
	const [ingSauceCount, setIngSauceCount] = useState(0)
	const [ingCheeseCount, setIngCheeseCount] = useState(0)
	const [ingMeatCount, setIngMeatCount] = useState(0)
	const [ingToppingCount, setIngToppingCount] = useState(0)

	useEffect(() => {
		if (buyAndBakeIngredients?.length > 0) {
			let baseArr = [], sauce = [], cheese = [], meat = [], topping = []
			for (let i = 0; i < props.buyAndBakeIngredients.length; i++) {

				const e = props.buyAndBakeIngredients[i]
				if (e.catType === 'base') {
					baseArr.push(e)
				}
				if (e.catType === 'sauce') {
					sauce.push(e)
				}
				if (e.catType === 'cheese') {
					cheese.push(e)
				}
				if (e.catType === 'meat') {
					meat.push(e)
				}
				if (e.catType === 'topping') {
					topping.push(e)
				}
			}
			prepareIngredientsData([baseArr, sauce, cheese, meat, topping])
		}else{
			setIngBase([]); setIngSauce([]); setIngCheese([]); setIngMeat([]); setIngTopping([]);
		}
	}, [buyAndBakeIngredients])

	useEffect(() => {
		if (errMsg) {
			setLoader(false)
		}
	}, [errMsg])

	const prepareIngredientsData = async (ingredeintsArr) => {
		await prepareMintsData(ingredeintsArr)
		setLoader(false)
	}

	const counts = () => {
		let baseCount = 0
		let sauceCount = 0
		let cheeseCount = 0
		let meatCount = 0
		let toppingCount = 0

		Promise.all(props?.ingPizza?.map((e) => {
			if (e?.catType === "base") {
				baseCount += 1
			} else if (e?.catType === "sauce") {
				sauceCount += 1
			} else if (e?.catType === "cheese") {
				cheeseCount += 1
			} else if (e?.catType === "meat") {
				meatCount += 1
			} else if (e?.catType === "topping") {
				toppingCount += 1
			} else { }
		}))

		return {
			baseCount, sauceCount, cheeseCount, meatCount, toppingCount
		}

	}
	const sortIng = (ing) => {
		const sorted = ing?.sort((a,b)=> a.layerNum - b.layerNum)
		setIngPizza([...sorted])
	}

	const manageBase = async (ingredient) => {
		if (forComponent === "rebake") {
			const { baseCount, sauceCount, cheeseCount, meatCount, toppingCount } = await counts()
			const { isExist } = isAlreadySelected(ingredient, selectedBase, 1)
			console.log("baseCount = ", baseCount)
			console.log("baseMax = ", baseMax)
			if (!isExist && (baseMax > baseCount)) {
				console.log('hi')
				setSelectedBase([...selectedBase, ingredient])
				sortIng([...ingPizza, ingredient])
				// setIngPizza([...ingPizza, ingredient])
			} else if (!isExist && (baseMax <= baseCount)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${baseMax} base.`)
				setTxState(2)
			}
		} else {
			const { isExist } = isAlreadySelected(ingredient, selectedBase, 1)
			if (!isExist && (selectedBase.length < baseMax)) {
				setSelectedBase([...selectedBase, ingredient])
			} else if (!isExist && (selectedBase.length <= baseMax - ingBaseCount)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${baseMax} base.`)
				setTxState(2)
			}
		}
	}

	const manageSauce = async (ingredient) => {
		if (forComponent === "rebake") {
			const { baseCount, sauceCount, cheeseCount, meatCount, toppingCount } = await counts()
			const { isExist } = isAlreadySelected(ingredient, selectedSauce, 2)
			if (!isExist && (sauceMax > sauceCount)) {
				setSelectedSauce([...selectedSauce, ingredient])
				sortIng([...ingPizza, ingredient])
				// setIngPizza([...ingPizza, ingredient])
			} else if (!isExist && (sauceMax <= sauceCount)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${sauceMax} sauce.`)
				setTxState(2)
			}
		} else {
			const { isExist } = isAlreadySelected(ingredient, selectedSauce, 2)
			if (!isExist && (selectedSauce.length < sauceMax)) {
				setSelectedSauce([...selectedSauce, ingredient])
			} else if (!isExist && (selectedSauce.length <= sauceMax)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${sauceMax} sauce.`)
				setTxState(2)
			}
		}
	}

	const manageCheese = async (ingredient) => {
		if (forComponent === "rebake") {
			const { baseCount, sauceCount, cheeseCount, meatCount, toppingCount } = await counts()
			const { isExist } = isAlreadySelected(ingredient, selectedCheese, 3)
			if (!isExist && (cheeseMax > cheeseCount)) {
				setSelectedCheese([...selectedCheese, ingredient])
				sortIng([...ingPizza, ingredient])
				// setIngPizza([...ingPizza, ingredient])
			} else if (!isExist && (cheeseMax <= cheeseCount)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${cheeseMax} cheese.`)
				setTxState(2)
			}
		} else {
			const { isExist } = isAlreadySelected(ingredient, selectedCheese, 3)
			if (!isExist && (selectedCheese.length < cheeseMax)) {
				setSelectedCheese([...selectedCheese, ingredient])
			} else if (!isExist && (selectedCheese.length <= cheeseMax)) {
				setShowTx(true)
				setTxError(`Pizza can have only ${cheeseMax} cheese.`)
				setTxState(2)
			}
		}
	}

	const manageMeats = async (ingredient) => {
		if (forComponent === "rebake") {
			const { baseCount, sauceCount, cheeseCount, meatCount, toppingCount } = await counts()
			const { isExist } = isAlreadySelected(ingredient, selectedMeats, 4)
			if (!isExist && (meatMax > meatCount)) {
				setSelectedMeats([...selectedMeats, ingredient])
				sortIng([...ingPizza, ingredient])
				// setIngPizza([...ingPizza, ingredient])
			} else if (!isExist && (meatMax <= meatCount)) {
				setShowTx(true)
				setTxError(`Pizza can have up to ${meatMax} meats.`)
				setTxState(2)
			}
		} else {
			const { isExist } = isAlreadySelected(ingredient, selectedMeats, 4)
			if (!isExist && (selectedMeats.length < meatMax)) {
				setSelectedMeats([...selectedMeats, ingredient])
			} else if (!isExist && (selectedMeats.length <= meatMax)) {
				setShowTx(true)
				setTxError(`Pizza can have up to ${meatMax} meats.`)
				setTxState(2)
			}
		}

	}

	const manageToppings = async (ingredient) => {
		if (forComponent === "rebake") {
			const { baseCount, sauceCount, cheeseCount, meatCount, toppingCount } = await counts()
			const { isExist } = isAlreadySelected(ingredient, selectedToppings, 5)
			if (!isExist && (toppingMax > toppingCount)) {
				setSelectedToppings([...selectedToppings, ingredient])
				sortIng([...ingPizza, ingredient])
				// setIngPizza([...ingPizza, ingredient])
			} else if (!isExist && (toppingMax <= toppingCount)) {
				setShowTx(true)
				setTxError(`Pizza can have up to ${toppingMax} toppings.`)
				setTxState(2)
			}
		} else {
			const { isExist } = isAlreadySelected(ingredient, selectedToppings, 5)
			if (!isExist && (selectedToppings.length < toppingMax)) {
				setSelectedToppings([...selectedToppings, ingredient])
			} else if (!isExist && (selectedToppings.length <= toppingMax)) {
				setShowTx(true)
				setTxError(`Pizza can have up to ${toppingMax} toppings.`)
				setTxState(2)
			}
		}
	}

	// check if already selected and unselect the ingredients
	const isAlreadySelected = (ingredient, seletedIngredients, type) => {
		const ingredients = []
		let isExist = false
		for (let index = 0; index < seletedIngredients.length; index++) {
			const selectedIngredient = seletedIngredients[index];
			if (selectedIngredient._ingredientId === ingredient._ingredientId) {
				isExist = true
				// remove for ingPizza in case of rebake
				console.log("hi yes ecist")
				if (props.forComponent === "rebake") {
					const pIng = []
					let count = 0
					Promise.all(ingPizza.map((e) => {
						console.log(e._ingredientId, selectedIngredient._ingredientId)
						if (e._ingredientId === selectedIngredient._ingredientId && count < 1) {
							count += 1
							console.log("this one is to be delete", e)
						} else {
							pIng.push(e)
						}
					}))
					sortIng([...pIng])
					// setIngPizza([...pIng])
				}
			} else {
				ingredients.push(selectedIngredient)
			}
		}

		// check which state to update 
		if (type === 1) {
			setSelectedBase([...ingredients])
		} else if (type === 2) {
			setSelectedSauce([...ingredients])
		} else if (type === 3) {
			setSelectedCheese([...ingredients])
		} else if (type === 4) {
			setSelectedMeats([...ingredients])
		} else if (type === 5) {
			setSelectedToppings([...ingredients])
		} else { }

		return { ingredients, isExist }
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

	return (
		<>
			<div className="ingredient-col">
				{
					forComponent == "onlyBake" ?
						<div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
							<span className="ingredients-heading-text ff-lato red-color">My Ingredients</span> 
						</div>:
						<div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
							<span className="ingredients-heading-text ff-lato">Select your Ingredients</span>
						</div>
				}
				{
					loader
						?
						<div className="d-flex justify-content-center align-items-center mt-5">
							<Loader />
						</div>
						:
						<>
							{ingBase && <IngredientBlock select={manageBase} selected={selectedBase} title="Base" noteText="A Pizza must have " atLEastNumber={`${baseMax} base only`} items={ingBase} />}
							{ingSauce && <IngredientBlock select={manageSauce} selected={selectedSauce} title="Sauce" noteText="A Pizza must have " atLEastNumber={`${sauceMax} sauce only`} items={ingSauce} />}
							{ingCheese && <IngredientBlock select={manageCheese} selected={selectedCheese} title="Cheese" noteText="A Pizza must have " atLEastNumber={`${cheeseMin} cheese or more`} items={ingCheese} />}
							{ingMeat && <IngredientBlock select={manageMeats} selected={selectedMeats} title="Meat" noteText="A Pizza can have " atLEastNumber={`up to ${meatMax} meats only`} items={ingMeat} />}
							{ingTopping && <IngredientBlock select={manageToppings} selected={selectedToppings} title="Topping" noteText="A Pizza can have " atLEastNumber={`up to ${toppingMax} toppings only`} items={ingTopping} />}
						</>
				}
				{
					!loader && errMsg && <div className="empty-box"><p>No Ingredient Available.</p></div>
				}
				{
					showTx && <TransactionModal setShow={setShowTx} tx={setTx} txState={txState} customError={txError} />
				}
			</div>
		</>
	);
}



export default SelectIngredient;