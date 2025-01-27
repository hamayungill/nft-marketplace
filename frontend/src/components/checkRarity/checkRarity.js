import React, { useEffect, useState } from 'react';
import { getIngredientsData, weitoEth } from '../../utils/web3';
import { connect } from 'react-redux';
import Loader from '../loader/loader';

function CheckRarity(props) {

	const [rarityChart, setRarityChart] = useState([])
	const [loader, setLoader] = useState(true)

	useEffect(()=> {
		if(props.ingredients?.length){
			prepareRaritychart(props.ingredients)			
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.ingredients])

	const prepareRaritychart = async(ingredientsArr) => {
		const ingredients = await sortInredientsByCatType(ingredientsArr)
		const rarityData = []
		for (let index = 0; index < ingredients.length; index++) {
			const e = ingredients[index];
			const res = await getIngredientRarity(e._ingredientId)
			let { name, rarity, usedIn } = res
			console.log(res)
			rarity = await weitoEth(rarity)
			rarity = await parseFloat(rarity)?.toFixed(2)
			rarityData.push({name, rarity, usedIn})
		}		
		setRarityChart(rarityData)
		setLoader(false)
	}

	const sortInredientsByCatType = async (ingredients) => {
		const baseArr = []
		const sauceArr = []
		const cheeseArr = []
		const meatArr = []
		const toppingArr = []

		Promise.all(ingredients.map((e)=> {
			if(e.catType === "base"){
				baseArr.push(e)
			}else if(e.catType === "sauce"){
				sauceArr.push(e)
			}else if(e.catType === "cheese"){
				cheeseArr.push(e)
			}else if(e.catType === "meat"){
				meatArr.push(e)
			}else if(e.catType === "topping"){
				toppingArr.push(e)
			}else {}
			return {} ;
		}))
		
		return [...baseArr, ...sauceArr, ...cheeseArr, ...meatArr, ...toppingArr]
	}

	const getIngredientRarity = async(_ingredientId) => {
		const res = await getIngredientsData(_ingredientId)
		return res
	}

	return (
		<div className="table-responsive">
			<table className="table pizza-rarity-table">
				<thead className="red-color ff-lato fw-bold">
					<tr>
						<th>Ingredients</th>
						<th className="text-center">Rarity</th>
						<th className="text-center"># of Pizzas</th>
					</tr>
				</thead>
				
				{
					<tbody className="ff-press-start">
						{
							loader ? 
							<tr><td></td><td><Loader /></td><td></td></tr>
							: <>
								{ rarityChart?.map((e, index)=> {
								return (
									<tr key={index} > 
										<td>{e.name}</td>
										<td className="text-center">{e.rarity}%</td>
										<td className="text-center">{e.usedIn}</td>
									</tr>
								)
							})}</>
						}
						
					</tbody>
				}
			</table>
		</div>
	);
}
const mapStateToProps = state =>{
	return{
		ingredients: state?.ingredient?.ingredients
	}
}
export default connect(mapStateToProps , {})(CheckRarity);