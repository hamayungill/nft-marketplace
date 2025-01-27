import React from 'react'
import './loader.css'
function Loader(){
    return (
       <div className='d-flex justify-content-center align-items-center loader'>
            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
       </div>
    )
}

export default Loader