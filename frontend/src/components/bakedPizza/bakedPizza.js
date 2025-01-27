import React, {useState ,  useEffect } from 'react';
import { connect } from 'react-redux';
import bakedPizzaImage from '../../assets/images/pizza-placeholder.png';
import './bakedPizza.css';
import {ENV} from '../../config/config';

function BakedPizza(props) {
	const { pizza:  { imageCloudinaryUrl , rarity , ingredients, _id } , setSelectedPizza, selectedPizza}  = props
	
	let pizzaRarity = parseFloat(rarity).toFixed(2)
	
	// pizza ingredients
	const [ingPizza , setIngPizza] = useState([])

	useEffect(() =>{
		if(ingredients && props.ingredients){
			let res = []
			for(let i=0 ; i<ingredients.length ; i++){
				const e =ingredients[i]
				let findOneIng=null;
				findOneIng = props.ingredients.filter(ing => ing._id  === e)
				res.push(findOneIng[0])	
			}
			sortIng(res)
		}
	},[])

	const sortIng = (ing) => {
		const sorted = ing?.sort((a,b)=> a.layerNum - b.layerNum)
		setIngPizza([...sorted])
	}
	
	const selectPizzaFn = (pizza) => {
		if(pizza?._id === selectedPizza?._id){
			setSelectedPizza(null)
		}else {
			setSelectedPizza(pizza)
		}
	}

	return (
		<div className={`baked-pizza-item transition position-relative mb-4 ${selectedPizza?._id == _id ? "selected" : ""}`}>
			<span className="baked-pizza-price ff-press-start">Rarity Score: {pizzaRarity}</span> 
			<div className="d-flex flex-column flex-sm-row">
				<div className="image-holder">
					<img className="img-fluid" src={imageCloudinaryUrl ? imageCloudinaryUrl : bakedPizzaImage} alt="" />
				</div>
				<ul className="ingredients list-unstyled flex-fill ff-press-start">
					{ 
						ingPizza && ingPizza.map((item,index)=>{
							return(
								<li key={index} className="mb-4">{ENV?.capitalizeFirstLetter(item?.name)}</li>
							)
						})
					}
				</ul>
			</div>
			<button className="btn-red-outline transition"  onClick={()=> selectPizzaFn(props?.pizza)}>{selectedPizza?._id === props?.pizza?._id ? "Selected" : "Select" }</button>
		</div>
	);
}

const mapStateToProps = state =>{
	return {
		ingredients: state?.ingredient?.ingredients,
	}
}

export default connect(mapStateToProps , {})(BakedPizza);