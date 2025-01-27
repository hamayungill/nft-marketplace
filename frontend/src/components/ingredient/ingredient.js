import React from 'react';
import IconEtherium from '../../assets/images/icon-etherium.svg'
import './ingredient.css';
function Ingredient(props) {
	const { item, added } = props
	return (

		<div className={`ingredient-item mb-3 transitions ${added && 'added'}`}>
			<div className="ingredient-image">
				{/* {item && console.log('item : ',item)} */}
				<img className="img-fluid" src={item.imageCloudinaryUrl ? item.imageCloudinaryUrl : ""} alt="ingredient Iage" />
			</div>
			<div className="indgredient-detail flex-fill d-flex justify-content-between">
				<div className="name-price-col d-flex flex-column">
					<div className='ingredient-content position-relative d-inlne-block'>
						<strong className="ingredient-name ff-press-start fw-normal d-inlne-block align-top">
							{item.title ? item.title : item.name ? item.name : ""}
							
						</strong>
						{item.balance && <span className='name-balance'>{item.balance}</span>}
					</div>
					<div className="d-flex align-items-center">
						{item.price && <span className="ingredient-price ff-press-start">{item.price}</span>}
						<span className="currency-icon">
							<img src={IconEtherium} alt="eterum icon" className='img-fluid'/>
						</span>
					</div>
				</div>
				<div className="add-qty-col d-flex flex-column">
					{(item?.minted && item?.total) && <span className="mb-3 qty-value">{item?.minted}/{item?.total} sold</span>}
					{props.addButton ?
						<button className="btn-red-outline transition" onClick={() => props.selectIngredient(item)}>{added ? 'Selected' : 'Select'}</button>
						:
						''
					}
				</div>
			</div>
		</div>
	);
}

export default Ingredient;