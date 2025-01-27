import React from 'react';
import HeroBanner from '../../components/heroBanner/heroBanner';
import PizzaCavePod from '../../components/pizzaCavePod/pizzaCavePod';
import RarityPod from '../../components/rarityPod/rarityPod';
import './home.css';
function Home(props) {
	return (
		<React.Fragment>
			<HeroBanner />
			<PizzaCavePod />
			<RarityPod />
		</React.Fragment>
	);
}

export default Home;