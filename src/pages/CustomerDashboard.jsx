import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import api, { API_URL } from '../api/axios';
import Navbar from '../components/Navbar';

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [openFilter, setOpenFilter] = useState('all');

  const categories = [
    '🍕 Pizza',
    '🍔 Burger',
    '🍛 Biryani',
    '🥗 Healthy',
    '🍟 Snacks',
    '🍰 Dessert'
  ];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurants');

      setRestaurants(res.data.data || []);
      setFilteredRestaurants(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restaurants fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    let data = [...restaurants];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
          item.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cityFilter !== 'all') {
      data = data.filter((item) => item.city === cityFilter);
    }

    if (openFilter !== 'all') {
      data = data.filter((item) =>
        openFilter === 'open' ? item.is_open : !item.is_open
      );
    }

    setFilteredRestaurants(data);
  }, [search, cityFilter, openFilter, restaurants]);

  const cities = ['all', ...new Set(restaurants.map((item) => item.city))];

  return (
    <>
      <Navbar />

      <section className="customer-home">
        <motion.div
          className="customer-hero"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="hero-badge">Welcome back 👋</span>
            <h1>Good Food, Great Mood</h1>
            <p>
              Hello {user?.name}, search restaurants and order your favourite food.
            </p>

            <div className="hero-search">
              <input
                type="text"
                placeholder="Search restaurant or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button>Search</button>
            </div>
          </div>

          <div className="hero-offer">
            <h2>🔥 50% OFF</h2>
            <p>On your favourite meals today</p>
            <span>Use coupon on checkout</span>
          </div>
        </motion.div>

        <div className="category-row">
          {categories.map((item, index) => (
            <motion.div
              className="mini-category"
              key={index}
              whileHover={{ y: -6 }}
            >
              {item}
            </motion.div>
          ))}
        </div>

        <div className="filter-box premium-filter">
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>

          <select value={openFilter} onChange={(e) => setOpenFilter(e.target.value)}>
            <option value="all">All Restaurants</option>
            <option value="open">Open Now</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="section-title">
          <h2>Top Restaurants</h2>
          <p>Fresh meals from nearby hotels.</p>
        </div>

        {loading && <h3>Loading restaurants...</h3>}

        {!loading && filteredRestaurants.length === 0 && (
          <div className="empty-box">
            <h2>No restaurants found</h2>
            <p>Try another search or filter.</p>
          </div>
        )}

        <div className="premium-restaurant-grid">
          {filteredRestaurants.map((item) => (
            <motion.div
              className="premium-restaurant-card"
              key={item.restaurant_id}
              whileHover={{ y: -8 }}
            >
              <div className="restaurant-image-wrap">
                <img
                  src={
                    item.image
                      ? `${API_URL}${food.image}`
                      : 'https://placehold.co/500x300?text=Restaurant'
                  }
                  alt={item.restaurant_name}
                />

                <span className={item.is_open ? 'open-pill' : 'closed-pill'}>
                  {item.is_open ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="premium-restaurant-body">
                <div className="restaurant-title-row">
                  <h3>{item.restaurant_name}</h3>
                  <span>⭐ 4.5</span>
                </div>

                <p>{item.description || 'Delicious food available here.'}</p>

                <div className="restaurant-meta">
                  <span>📍 {item.city}</span>
                  <span>⏱ 25-35 min</span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/restaurant/${item.restaurant_id}/menu`)
                  }
                >
                  View Menu
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          className="floating-cart"
          onClick={() => navigate('/cart')}
        >
          🛒 Cart
        </button>
      </section>
    </>
  );
}

export default CustomerDashboard;