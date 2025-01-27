import React from 'react';
import { Link } from "react-router-dom";
import pizzaImage from '../../assets/images/pizza-img-02.svg';
import './rarityPod.css';
function RarityPod(props) {
	return (
		<section id="rarity-pod">
            <div className="pod-block d-flex align-items-center">
                <div className="image-holder order-1 order-lg-2">
                    <img className="img-fluid" src={pizzaImage} alt="" />
                </div>
                <div className="text-holder flex-fill order-2 order-lg-1 text-white">
                    <div className="text-block ff-lato">
                        <h2 className="ff-press-start">Check Rarity Rewards</h2>
                        <p>Find out more about Rarity Rewards</p>
                    </div>
                    <Link to="/rarity-rewards" className="btn-yellow transition ff-lato fw-900 d-inline-block align-top">Rarity Rewards</Link>
                </div>
            </div>
		</section>
	);
}

export default RarityPod;