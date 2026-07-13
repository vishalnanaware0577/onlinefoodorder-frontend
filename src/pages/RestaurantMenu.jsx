import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaHeart } from 'react-icons/fa';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';

function RestaurantMenu() {
  const { restaurantId } = useParams();

  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [sort, setSort] = useState('default');

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/food/restaurant/${restaurantId}`);
      setFoods(res.data.data || []);
      setFilteredFoods(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Menu fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (foodId) => {
    try {
      const res = await api.post('/wishlist/toggle', {
        food_id: foodId
      });

      toast.success(res.data.message || 'Wishlist updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Wishlist update failed');
    }
  };

  const addToCart = async (foodId) => {
    try {
      await api.post('/cart/add', {
        food_id: foodId,
        quantity: 1
      });

      toast.success('Food added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Add to cart failed');
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    let data = [...foods];

    if (search.trim()) {
      data = data.filter(
        (food) =>
          food.food_name.toLowerCase().includes(search.toLowerCase()) ||
          food.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (foodType !== 'all') {
      data = data.filter((food) => food.food_type === foodType);
    }

    if (sort === 'low') {
      data.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === 'high') {
      data.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredFoods(data);
  }, [search, foodType, sort, foods]);

  return (
    <>
      <Navbar />

      <section className="dashboard-page">
        <div className="dashboard-header">
          <h1>Restaurant Menu</h1>
          <p>Search dishes, filter veg/non-veg and sort by price.</p>
        </div>

        <div className="filter-box">
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          >
            <option value="all">All Food</option>
            <option value="veg">Veg</option>
            <option value="non_veg">Non-Veg</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Default Sort</option>
            <option value="low">Price Low to High</option>
            <option value="high">Price High to Low</option>
          </select>
        </div>

        {loading && <h3>Loading menu...</h3>}

        {!loading && filteredFoods.length === 0 && (
          <div className="empty-box">
            <h2>No food items found</h2>
            <p>Try another search or filter.</p>
          </div>
        )}

        <div className="premium-food-grid">
          {filteredFoods.map((food) => (
            <motion.div
              className="premium-food-card"
              key={food.food_id}
              whileHover={{ y: -8 }}
            >
              <div className="food-image-box">
                <img
                  src={
                    food.image
                      ? `${API_URL}${food.image}`
                      : 'https://placehold.co/500x350?text=Food'
                  }
                  alt={food.food_name}
                />

                <button
                  className="wishlist-btn"
                  onClick={() => toggleWishlist(food.food_id)}
                >
                  <FaHeart />
                </button>

                <span className="offer-tag">20% OFF</span>
              </div>

              <div className="food-info">
                <div className="food-top">
                  <h3>{food.food_name}</h3>
                  <span className="rating-chip">⭐ 4.5</span>
                </div>

                <p>{food.description || 'Fresh and tasty food.'}</p>

                <div className="food-details">
                  <span>{food.food_type === 'veg' ? '🟢 Veg' : '🔴 Non Veg'}</span>
                  <span>⏱ 20 mins</span>
                </div>

                <div className="food-bottom">
                  <div>
                    <h2>₹{food.price}</h2>
                    <small>Bestseller</small>
                  </div>

                  <button onClick={() => addToCart(food.food_id)}>
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default RestaurantMenu;