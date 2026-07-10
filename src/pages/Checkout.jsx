import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [foodTotal, setFoodTotal] = useState(0);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const deliveryCharge = foodTotal > 0 ? 40 : 0;
  const gst = Math.round(foodTotal * 0.05);
  const grandTotal = foodTotal + deliveryCharge + gst - discountAmount;

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart/my');
      setCartItems(res.data.data?.cart?.items || []);
      setFoodTotal(Number(res.data.data?.totalAmount || 0));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cart fetch failed');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.warning('Enter coupon code');
      return;
    }

    if (cartItems.length === 0) {
      toast.warning('Cart is empty');
      return;
    }

    try {
      const restaurantId = cartItems[0]?.food?.restaurant_id;

      const res = await api.post('/coupons/apply', {
        restaurant_id: restaurantId,
        coupon_code: couponCode,
        total_amount: foodTotal
      });

      setDiscountAmount(Number(res.data.data.discount_amount || 0));
      toast.success('Coupon applied successfully');
    } catch (error) {
      setDiscountAmount(0);
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.warning('Cart is empty');
      return;
    }

    if (!deliveryAddress.trim() || !mobile.trim()) {
      toast.warning('Please enter address and mobile number');
      return;
    }

    try {
      setLoading(true);

      const fullAddress = `${deliveryAddress}, Mobile: ${mobile}`;

      const orderRes = await api.post('/orders/place', {
        delivery_address: fullAddress,
        payment_method: paymentMethod
      });

      const appOrder = orderRes.data.data;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully');

        navigate('/order-success', {
          state: {
            order: appOrder,
            grandTotal
          }
        });

        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const razorpayRes = await api.post('/payments/create-order', {
        order_id: appOrder.order_id
      });

      const paymentData = razorpayRes.data.data;

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'FoodOrder',
        description: `Payment for Order #${appOrder.order_id}`,
        order_id: paymentData.razorpay_order_id,

        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              order_id: appOrder.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful');

            navigate('/order-success', {
              state: {
                order: {
                  ...appOrder,
                  payment_status: 'paid',
                  payment_method: 'razorpay'
                },
                grandTotal
              }
            });
          } catch (error) {
            toast.error(
              error.response?.data?.message || 'Payment verification failed'
            );
          }
        },

        prefill: {
          contact: mobile
        },

        theme: {
          color: '#ff5a1f'
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function () {
        toast.error('Payment failed');
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order place failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <>
      <Navbar />

      <section className="premium-checkout-page">
        <div className="section-title">
          <h2>Checkout</h2>
          <p>Confirm your address, coupon and payment method.</p>
        </div>

        <form className="premium-checkout-layout" onSubmit={placeOrder}>
          <div className="checkout-left">
            <motion.div
              className="checkout-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>📍 Delivery Details</h2>

              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />

              <textarea
                placeholder="Enter full delivery address"
                rows="5"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </motion.div>

            <motion.div
              className="checkout-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>🎁 Apply Coupon</h2>

              <div className="coupon-row">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />

                <button type="button" onClick={applyCoupon}>
                  Apply
                </button>
              </div>

              {discountAmount > 0 && (
                <p className="coupon-success">
                  You saved ₹{discountAmount}
                </p>
              )}
            </motion.div>

            <motion.div
              className="checkout-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>💳 Payment Method</h2>

              <label className="payment-option">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Razorpay Online Payment
              </label>
            </motion.div>
          </div>

          <motion.div
            className="premium-bill-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="summary-food" key={item.cart_item_id}>
                <span>
                  {item.food?.food_name} x {item.quantity}
                </span>
                <b>₹{Number(item.price) * Number(item.quantity)}</b>
              </div>
            ))}

            <hr />

            <div className="bill-row">
              <span>Food Total</span>
              <b>₹{foodTotal}</b>
            </div>

            <div className="bill-row">
              <span>Delivery</span>
              <b>₹{deliveryCharge}</b>
            </div>

            <div className="bill-row">
              <span>GST</span>
              <b>₹{gst}</b>
            </div>

            <div className="bill-row discount">
              <span>Discount</span>
              <b>- ₹{discountAmount}</b>
            </div>

            <hr />

            <div className="bill-row grand">
              <span>Grand Total</span>
              <b>₹{grandTotal}</b>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </motion.div>
        </form>
      </section>
    </>
  );
}

export default Checkout;