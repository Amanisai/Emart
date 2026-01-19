import React from 'react'
import { kitchenData } from '../data/kitchen'
import { Link } from 'react-router-dom'

const Kitchen = () => {
    const firstFiveImages = kitchenData.slice(0,5)
  return (
    <>
   <div className="proTitle">
        <h2>Furniture</h2>
      </div>
   <div className='proSection'>
        {
            firstFiveImages.map((item, idx)=>{
                return(
                    <div className='imgBox' key={item?.id ?? item?.image ?? idx}>
                        <Link to='/kitchen'>
                        <img className='proImage' src={item.image} alt="" />
                        </Link>
                    </div>
                )
            })
        }
    </div>
   
   </>
  )
}

export default Kitchen