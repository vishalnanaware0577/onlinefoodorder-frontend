import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const deliveryCharge = cartItems.length > 0 ? 40 : 0;
  const gst = Math.round(Number(totalAmount) * 0.05);
  const grandTotal = Number(totalAmount) + deliveryCharge + gst;

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart/my');
      setCartItems(res.data.data?.cart?.items || []);
      setTotalAmount(res.data.data?.totalAmount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cart fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      toast.warning('Quantity must be at least 1');
      return;
    }

    try {
      await api.put(`/cart/item/${cartItemId}`, { quantity });
      toast.success('Quantity updated');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Quantity update failed');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/item/${cartItemId}`);
      toast.success('Item removed');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Item remove failed');
    }
  };

  const checkout = () => {
    if (cartItems.length === 0) {
      toast.warning('Cart is empty');
      return;
    }

    navigate('/checkout');
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <>
      <Navbar />

      <section className="premium-cart-page">
        <div className="section-title">
          <h2>My Cart 🛒</h2>
          <p>Review your items before checkout.</p>
        </div>

        {loading && <h3>Loading cart...</h3>}

        {!loading && cartItems.length === 0 && (
          <div className="empty-box">
            <h2>Your cart is empty</h2>
            <p>Add tasty food from restaurants.</p>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <div className="premium-cart-layout">
            <div className="premium-cart-list">
              {cartItems.map((item) => (
                <motion.div
                  className="premium-cart-item"
                  key={item.cart_item_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <img
                    src={
                      item.food?.image
                        ? `http://localhost:3000${item.food.image}`
                        : 'https://placehold.co/160x160?text=Food'
                    }
                    alt={item.food?.food_name}
                  />

                  <div className="premium-cart-info">
                    <h3>{item.food?.food_name}</h3>
                    <p>{item.food?.description || 'Fresh and tasty food.'}</p>
                    <b>₹{item.price}</b>

                    <div className="premium-qty">
                      <button
                        onClick={() =>
                          updateQuantity(item.cart_item_id, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.cart_item_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="premium-cart-price">
                    <h3>₹{Number(item.price) * Number(item.quantity)}</h3>
                    <button onClick={() => removeItem(item.cart_item_id)}>
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="premium-bill-card">
              <h2>Bill Details</h2>

              <div className="bill-row">
                <span>Items Total</span>
                <b>₹{totalAmount}</b>
              </div>

              <div className="bill-row">
                <span>Delivery Fee</span>
                <b>₹{deliveryCharge}</b>
              </div>

              <div className="bill-row">
                <span>GST</span>
                <b>₹{gst}</b>
              </div>

              <div className="coupon-mini">
                🎁 Apply coupon on checkout
              </div>

              <hr />

              <div className="bill-row grand">
                <span>Grand Total</span>
                <b>₹{grandTotal}</b>
              </div>

              <button onClick={checkout}>
                Proceed To Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Cart;