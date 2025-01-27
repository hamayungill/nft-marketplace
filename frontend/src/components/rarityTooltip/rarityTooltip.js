import React from 'react'
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const RarityTooltip = () => {
  return (
    <>
      <div className='main-tooltip'>
        <span data-tip="Use the Check Rarity tool to check the current percentage and number of baked pizzas that include each ingredient. This information is updated and recalculated each time the composition of any pizza is changed (Baked/Unbaked/Rebaked). Updates may be subject to lags.">
          <FontAwesomeIcon icon={faCircleInfo}/>
        </span>
      </div>
      <div >
        <ReactTooltip className='tooltip-content'/>
      </div>
    </>
  )
}

export default RarityTooltip