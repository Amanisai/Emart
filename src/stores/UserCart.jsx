import React, { useMemo, useState } from 'react'
import { useCart } from './context/CartContext'
import Navbar from './components/Navbar';
import { formatCurrency, getProductTitle, parsePrice } from './utils/product';
import { useToast } from './context/ToastContext';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiMinus, FiPlus, FiTag, FiTrash2 } from 'react-icons/fi';



const UserCart = () => {

        const { cartItems, totals, removeFromCart, increaseQty, decreaseQty } = useCart()
        const { showToast } = useToast()

        const [coupon, setCoupon] = useState("")
        const [appliedCoupon, setAppliedCoupon] = useState(null)

        const discount = useMemo(() => {
            if (!appliedCoupon) return 0
            if (appliedCoupon === 'SAVE10') return totals.subtotal * 0.10
            return 0
        }, [appliedCoupon, totals.subtotal])

        const tax = useMemo(() => 0, [])
        const total = useMemo(() => Math.max(0, totals.subtotal - discount + tax), [totals.subtotal, discount, tax])

  return (
<>
<Navbar />
<div>
    <h2 className='y-cart'>Your Cart</h2>
 {cartItems.length ===0 ?
        (<p className='empty'>Your Cart is Empty</p>):
     <div className='cartPage'>
         <div className='cartItems'>
            {cartItems.map((row)=>{
                const item = row.item
                const price = parsePrice(item.price)
                return(
                        <div key={row.key} className='cart-section'>
                                <div className="cart-img">
                                        <img src={item.image} alt={getProductTitle(item)} />
                                </div>
                                <div className="cart-details">
                                        <h3>{getProductTitle(item)}</h3>
                                        <h2>{formatCurrency(price)}</h2>
                                        <div className='qtyControl small'>
                                            <button type='button' onClick={() => decreaseQty(row.key, 1)} aria-label='Decrease quantity'><FiMinus aria-hidden='true' /></button>
                                            <span>{row.quantity}</span>
                                            <button type='button' onClick={() => increaseQty(row.key, 1)} aria-label='Increase quantity'><FiPlus aria-hidden='true' /></button>
                                        </div>
                                </div>
                                    <button className='removeBtn' onClick={() => removeFromCart(row.key)}><FiTrash2 aria-hidden='true' /> Remove</button>
                        </div>
                )
            })}
         </div>

         <div className='cartSummary'>
                <h3>Price Breakdown</h3>
                <div className='summaryRow'><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                <div className='summaryRow'><span>Discount</span><span>-{formatCurrency(discount)}</span></div>
                <div className='summaryRow'><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                <div className='summaryRow total'><span>Final Total</span><span>{formatCurrency(total)}</span></div>

                <Link to='/checkout/address' className='custom-link'>
                    <button type='button' className='btnPrimary cartCheckoutBtn'><FiCreditCard aria-hidden='true' /> Proceed to Checkout</button>
                </Link>

                <div className='couponRow'>
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder='Coupon code' />
                    <button
                        type='button'
                        onClick={() => {
                            const code = coupon.trim().toUpperCase()
                            if (!code) return
                            if (code === 'SAVE10') {
                                setAppliedCoupon(code)
                                showToast('Coupon applied', 'success')
                            } else {
                                setAppliedCoupon(null)
                                showToast('Invalid coupon', 'error')
                            }
                        }}
                    >
                        <FiTag aria-hidden='true' /> Apply
                    </button>
                </div>
                {appliedCoupon ? <div className='applied'>Applied: {appliedCoupon}</div> : null}
         </div>
     </div>

}
     
    </div>
</>
  )
}

export default UserCart