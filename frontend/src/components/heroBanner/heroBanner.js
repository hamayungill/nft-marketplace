import React from 'react';
import './heroBanner.css';

function HeroBanner(props) {

	return (
		<section id="hero-banner" className="d-flex justify-content-center align-items-center px-3">
			<div className="banner-content ff-press-start text-center">
				<h1>Bake the RAREST Pizza</h1>
				<h2>To get Rarity Rewards</h2>
			</div>
		</section>
	);
}

export default HeroBanner;