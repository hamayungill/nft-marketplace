import React , {useEffect, useState} from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import PizzaCaveHeader from '../../components/pizzaCaveHeader/pizzaCaveHeader';
import PizzaCaveBuyAndBake from '../../components/pizzaCaveBuyAndBake/pizzaCaveBuyAndBake';
import PizzaCaveUnBake from '../../components/pizzaCaveUnBake/pizzaCaveUnBake';
import PizzaCaveReBake from '../../components/pizzaCaveReBake/pizzaCaveReBake';
import PizzaCaveRandomBake from '../../components/pizzaCaveRandomBake/pizzaCaveRandomBake';
import PizzaCaveBake from '../../components/pizzaCaveBake/pizzaCaveBake';
import './pizzaCave.css';

//set state from url hash
const remFirstCh =( data )=>{
	if(data.length){		
		while(data.charAt(0) === '#')
		{
		 data = data.substring(1);
		 return data
		}		
	}
	else{
		return "buy-and-bake" ;
	}
}

function PizzaCave(props) {

	const [selectedTab, setSelectedTab] = useState(remFirstCh(props.location.hash));
	const [forceRender , setForceRender] = useState(true)

	const handleSelect = (key) =>{
		setSelectedTab(key)
		props.history.replace({
			hash : `${key}`
		})
	}

	useEffect(()=>{
		setSelectedTab(remFirstCh(props.location.hash))
	},[props.location.hash])

	return (
		<React.Fragment>
			<PizzaCaveHeader />
			<section className="pizza-cave-content">
				<Tabs defaultActiveKey="buy-and-bake"  activeKey={selectedTab ? selectedTab : 'buy-and-bake'} onSelect={handleSelect} id="uncontrolled-tab-example">
					<Tab eventKey="buy-and-bake" title="Buy &amp; Bake">
						{
							selectedTab === "buy-and-bake" && 
							<PizzaCaveBuyAndBake />
						}
					</Tab>
					<Tab eventKey="bake" title="Bake">
						{
							selectedTab === "bake" && 
							<PizzaCaveBake setForceRender={setForceRender}/>
						}
					</Tab>
					<Tab eventKey="unbake" title="Unbake">
						{
							selectedTab === "unbake" && 
							<PizzaCaveUnBake />
						}
					</Tab>
					<Tab eventKey="rebake" title="Rebake">
						{
							selectedTab === "rebake" && 
							<PizzaCaveReBake />
						}
					</Tab>
					<Tab eventKey="random-bake" title="Random Bake">
						{
							selectedTab === "random-bake" && 
							<PizzaCaveRandomBake />
						}
					</Tab>
				</Tabs>
			</section>
		</React.Fragment>
	);
}

export default PizzaCave;