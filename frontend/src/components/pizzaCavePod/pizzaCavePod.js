import React from 'react';
import { Link } from "react-router-dom";
// import { Container } from 'react-bootstrap';
import pizzaImage from '../../assets/images/pizza-image.png';
import './pizzaCavePod.css';
import {ENV} from '../../config/config';

function PizzaCavePod(props) {
	
	return (
		<section id="pizza-cave-pod">
			<div className="heading-section">
				<h2 className="ff-lato fw-bold">Getting started</h2>
			</div>
			<div className="pizza-cave-pod">
				<div className="pod-block d-flex mb-4">
					<div className="image-holder">
						<img className="img-fluid" src={pizzaImage} alt="" />
					</div>
					<div className="text-holder">
						<div className="text-block ff-lato">
							<h2 className="ff-press-start">Buy Ingredients and Bake a Pizza</h2>
							<p>Select your hand-crafted ingredients freshly prepared by our pixel artists.</p>
						</div>
						<Link to="/pizza-cave" className="btn-red transition ff-lato fw-900 d-inline-block align-top">Head to {ENV.appName} Cave</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

export default PizzaCavePod;