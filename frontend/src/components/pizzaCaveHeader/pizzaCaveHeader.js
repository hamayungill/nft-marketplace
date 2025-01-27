import React from 'react';
import pizzaImage from '../../assets/images/pizza-image.png';
import './pizzaCaveHeader.css';
function PizzaCaveHeader(props) {
	return (
		<section id="pizza-cave-header" className="pizza-cave-header yellow-bg d-flex align-items-center">
			<div className="image-holder">
				<img className="img-fluid" src={pizzaImage} alt="PizzaCaveNotFound"/>
			</div>
			<div className="text-holder">
				<h1 className="ff-press-start my-0">Pizza Cave</h1>
			</div>
		</section>
	);
}

export default PizzaCaveHeader;