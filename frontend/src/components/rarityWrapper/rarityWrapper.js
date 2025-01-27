import React from 'react';
import { ENV } from '../../config/config';
import './rarityWrapper.css';

function RaityWrapper(props) {
    let pizzaRarity = parseFloat(props?.rarityScore).toFixed(2)
    let pizzaReward = parseFloat(props?.rewardPrice).toFixed(12)
    return (
        <React.Fragment>
            <div className="rarity-wrapper">
                <div className="rarity-data">
                    <div className="rarity-image">
                        <img src={props?.image} alt="rarityNotFound" className="img-fluid" />
                    </div>
                    <div className="rarity-content">
                        <a target="_blank" href={`${ENV?.openSea}/${ENV?.pizzaContract}/${props?.nftId}`}><span className="ff-press-start user-id red-color">{props?.id}</span></a>
                        {props.userDate ?
                            <span className="ff-press-start fw-normal user-date">{props?.date}</span>
                            :
                            ""
                        }
                        {
                            props?.rewardPrice ? <span className="ff-press-start fw-normal user-date">Prize: {pizzaReward}</span> : ""
                        }
                    </div>
                </div>
                <div className="rarity-button" style={{ backgroundColor: props.bgcolor, color: props.color }}>
                    <span className="rarity-price-tag rarity-tag-absolute ff-press-start fw-normal fst-normal">Rarity Score: {pizzaRarity}</span>
                </div>
            </div>
        </React.Fragment>
    );
}

export default RaityWrapper; 