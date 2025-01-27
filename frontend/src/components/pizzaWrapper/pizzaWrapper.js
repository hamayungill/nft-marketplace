import React from 'react';
import './pizzaWrapper.css';

function PizzaWrapper(props) {
    let rarityScore = parseFloat(props.rarity).toFixed(2)
    return (
        <React.Fragment>
            <div className="pizza-wrapper">
                <div className="pizza-data d-flex flex-column flex-sm-row">
                    <div className="pizza-image">
                        <img src={props.image} alt="PizzNotFound" className="img-fluid" />
                    </div>
                    <div className="pizza-content">
                        {props.ingAll && props.ingAll.map((item , index)=>{
                            return(
                                <div key={index}>
                                    <span className="ff-press-start pizza-ing">{item?.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="pizza-button" style={{ backgroundColor: props.bgcolor, color: props.color }}>
                    <span className="pizza-price-tag rarity-tag-absolute ff-press-start fw-normal fst-normal" >Rarity Score: {rarityScore}</span>
                </div>
            </div>
        </React.Fragment>
    );
}

export default PizzaWrapper; 