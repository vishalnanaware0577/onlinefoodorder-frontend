import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

function Landing() {
  return (
    <>
      <Navbar />

      <section className="premium-hero">
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="hero-badge">Fast • Fresh • Tasty</span>
          <h1>Order Food Online From Your Favourite Restaurants</h1>
          <p>
            Browse restaurants, add food to cart, pay online or COD, and track your order live.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">Order Now</Link>
            <Link to="/login" className="secondary-btn">Login</Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-food-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="big-food">🍔</div>
          <h2>Hot Burger</h2>
          <p>Delivered in 25 minutes</p>
          <b>₹149</b>
        </motion.div>
      </section>

      <section className="category-section">
        <h2>Popular Categories</h2>

        <div className="category-grid">
          {['🍕 Pizza', '🍔 Burger', '🍛 Biryani', '🥗 Healthy', '🍟 Snacks', '🍰 Desserts'].map((item) => (
            <motion.div
              className="category-card"
              key={item}
              whileHover={{ y: -8 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="why-section">
        <h2>Why Choose FoodOrder?</h2>

        <div className="why-grid">
          <div>
            <h3>🚀 Fast Delivery</h3>
            <p>Quick food delivery with live tracking.</p>
          </div>

          <div>
            <h3>💳 Secure Payment</h3>
            <p>Razorpay and Cash on Delivery supported.</p>
          </div>

          <div>
            <h3>🏨 Restaurant Panel</h3>
            <p>Hotel owners can manage food and orders.</p>
          </div>

          <div>
            <h3>🚴 Delivery Partner</h3>
            <p>Partners can accept and deliver orders.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h2>FoodOrder</h2>
        <p>Online Food Ordering System Project</p>
        <span>Customer • Hotel Owner • Delivery Partner</span>
      </footer>
    </>
  );
}

export default Landing;