import React  from 'react';
import Ingredient from '../ingredient/ingredient';
import './ingredientBlock.css';

function IngredientBlock(props) {

	const selectIngredient = (ingredient) => {
		props.select(ingredient)
	}

	const checkIsAdded = (_ingredientId) => {
		let ingredients = props.selected
		if(ingredients){
			for (let index = 0; index < ingredients.length; index++) {
				const e = ingredients[index];
				if(e._ingredientId === _ingredientId){
					return true
				}
			}
		}

		return false 
	}

	return (
		<article className="ingredient-block">
			<h3 className="ingredient-heading ff-lato fw-900 red-color mb-4">{props.title}</h3>
			<p>{props?.noteText} <span className="red-color">{props.atLEastNumber} </span></p>
			{
				props.items && props.items.map((item,index)=>{
					return(
						<div className="ingredients-list" key ={index}>
							<Ingredient selectIngredient={selectIngredient} item={item} addButton={true} added={checkIsAdded(item._ingredientId)}/>
						</div>
					)
				})
			}
			{
				!props.items.length && <div className="empty-box"><p>No {props?.title} Available.</p></div> 
			}				
		</article>
	);
}

export default IngredientBlock;