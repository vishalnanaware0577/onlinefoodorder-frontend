import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome, FaTruck } from 'react-icons/fa';

import Navbar from '../components/Navbar';

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;
  const grandTotal = location.state?.grandTotal;

  if (!order) {
    navigate('/customer');
    return null;
  }

  return (
    <>
      <Navbar />

      <section className="success-page">
        <motion.div
          className="success-card"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6
          }}
        >
          <FaCheckCircle className="success-icon" />

          <h1>Order Placed Successfully</h1>

          <p>
            Thank you for ordering with us.
            <br />
            Your food is being prepared.
          </p>

          <div className="success-details">

            <div>
              <span>Order ID</span>
              <b>#{order.order_id}</b>
            </div>

            <div>
              <span>Payment</span>
              <b>{order.payment_method.toUpperCase()}</b>
            </div>

            <div>
              <span>Total</span>
              <b>₹{grandTotal}</b>
            </div>

            <div>
              <span>Estimated Delivery</span>
              <b>25 - 35 Minutes</b>
            </div>

          </div>

          <div className="success-buttons">

            <button
              className="track-btn"
              onClick={() => navigate('/my-orders')}
            >
              <FaTruck />
              Track Order
            </button>

            <button
              className="home-btn"
              onClick={() => navigate('/customer')}
            >
              <FaHome />
              Back Home
            </button>

          </div>

        </motion.div>
      </section>
    </>
  );
}

export default OrderSuccess;