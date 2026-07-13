import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';

function HotelOwnerDashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [foodsCount, setFoodsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    restaurant_name: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    image: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const restaurantRes = await api.get('/restaurants/my');
      const orderRes = await api.get('/orders/hotel/my');
      const reviewRes = await api.get('/reviews/hotel-owner/my');

      const myRestaurants = restaurantRes.data.data || [];
      const myOrders = orderRes.data.data || [];
      const myReviews = reviewRes.data.data || [];

      setRestaurants(myRestaurants);
      setOrders(myOrders);
      setReviews(myReviews);

      let totalFoods = 0;

      for (const restaurant of myRestaurants) {
        const foodRes = await api.get(`/food/restaurant/${restaurant.restaurant_id}`);
        totalFoods += foodRes.data.data?.length || 0;
      }

      setFoodsCount(totalFoods);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Dashboard data fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const revenue = orders
      .filter((order) => order.order_status === 'delivered')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    const today = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter((order) =>
      String(order.createdAt || '').slice(0, 10) === today
    ).length;

    return {
      revenue,
      todayOrders,
      totalOrders: orders.length,
      totalRestaurants: restaurants.length,
      totalFoods: foodsCount,
      totalReviews: reviews.length
    };
  }, [orders, restaurants, reviews, foodsCount]);

  const monthlySales = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const revenue = orders
        .filter((order) => {
          const date = new Date(order.createdAt);
          return date.getMonth() === index && order.order_status === 'delivered';
        })
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

      return { month, revenue };
    });
  }, [orders]);

  const statusMix = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      map[order.order_status] = (map[order.order_status] || 0) + 1;
    });

    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const createRestaurant = async (e) => {
    e.preventDefault();

    if (
      !form.restaurant_name ||
      !form.address ||
      !form.city ||
      !form.pincode ||
      !form.phone
    ) {
      toast.warning('Please fill required fields');
      return;
    }

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });

      await api.post('/restaurants', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Restaurant created successfully');

      setForm({
        restaurant_name: '',
        description: '',
        address: '',
        city: '',
        pincode: '',
        phone: '',
        image: null
      });

      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restaurant create failed');
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success('Restaurant deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restaurant delete failed');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navbar />

      <section className="owner-premium-page">
        <div className="section-title">
          <h2>Hotel Owner Dashboard 🏨</h2>
          <p>Manage restaurants, foods, orders and revenue.</p>
        </div>

        {loading && <h3>Loading dashboard...</h3>}

        <div className="owner-stats-grid">
          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>💰</span>
            <h3>₹{stats.revenue}</h3>
            <p>Total Revenue</p>
          </motion.div>

          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>📦</span>
            <h3>{stats.todayOrders}</h3>
            <p>Today's Orders</p>
          </motion.div>

          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>🏨</span>
            <h3>{stats.totalRestaurants}</h3>
            <p>Restaurants</p>
          </motion.div>

          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>🍔</span>
            <h3>{stats.totalFoods}</h3>
            <p>Food Items</p>
          </motion.div>

          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>⭐</span>
            <h3>{stats.totalReviews}</h3>
            <p>Reviews</p>
          </motion.div>

          <motion.div className="owner-stat-card" whileHover={{ y: -6 }}>
            <span>🧾</span>
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </motion.div>
        </div>

        <div className="owner-chart-layout">
          <div className="owner-chart-card">
            <h2>📈 Monthly Sales</h2>

            <div className="simple-chart">
              {monthlySales.map((item) => (
                <div key={item.month}>
                  <span>{item.month}</span>
                  <div>
                    <b style={{ height: `${Math.max(item.revenue / 20, 8)}px` }} />
                  </div>
                  <small>₹{item.revenue}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="owner-chart-card">
            <h2>🥧 Order Status</h2>

            <div className="status-mix-list">
              {statusMix.length === 0 && <p>No order data</p>}

              {statusMix.map((item) => (
                <div key={item.status}>
                  <span>{item.status}</span>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="owner-premium-layout">
          <div className="owner-form-card">
            <h2>Create Restaurant</h2>

            <form onSubmit={createRestaurant}>
              <input
                type="text"
                name="restaurant_name"
                placeholder="Restaurant Name"
                value={form.restaurant_name}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />

              <textarea
                name="address"
                placeholder="Full Address"
                rows="3"
                value={form.address}
                onChange={handleChange}
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
              />

              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

              <button type="submit">Create Restaurant</button>
            </form>
          </div>

          <div className="owner-list-card">
            <h2>My Restaurants</h2>

            {restaurants.length === 0 && (
              <div className="empty-box">
                <h3>No restaurant created</h3>
              </div>
            )}

            <div className="owner-restaurant-list">
              {restaurants.map((item) => (
                <div className="owner-restaurant-item" key={item.restaurant_id}>
                  <img
                    src={
                      item.image
                        ? `${API_URL}${item.image}`
                        : 'https://placehold.co/120x90?text=Hotel'
                    }
                    alt={item.restaurant_name}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/120x90?text=Hotel';
                    }}
                  />

                  <div className="owner-restaurant-info">
                    <h3>{item.restaurant_name}</h3>
                    <p>{item.city}</p>
                    <p>
                      <b>Status:</b> {item.status}
                    </p>
                  </div>

                  <div className="owner-actions">
                    <button
                      className="food-btn"
                      onClick={() =>
                        navigate(
                          `/hotel-owner/restaurant/${item.restaurant_id}/foods`
                        )
                      }
                    >
                      Manage Food
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteRestaurant(item.restaurant_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="owner-chart-card recent-orders-card">
          <h2>📅 Recent Orders</h2>

          {orders.slice(0, 5).map((order) => (
            <div className="recent-order-row" key={order.order_id}>
              <span>#{order.order_id}</span>
              <b>₹{order.total_amount}</b>
              <p>{order.order_status}</p>
            </div>
          ))}

          {orders.length === 0 && <p>No recent orders</p>}
        </div>
      </section>
    </>
  );
}

export default HotelOwnerDashboard;