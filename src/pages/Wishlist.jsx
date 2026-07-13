import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const res = await api.get('/wishlist/my');

      setWishlist(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Wishlist fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const removeWishlist = async (foodId) => {
    try {
      await api.post('/wishlist/toggle', {
        food_id: foodId
      });

      toast.success('Removed from wishlist');

      fetchWishlist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Remove failed');
    }
  };

  const addToCart = async (foodId) => {
    try {
      await api.post('/cart/add', {
        food_id: foodId,
        quantity: 1
      });

      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Add to cart failed');
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <Navbar />

      <section className="dashboard-page">
        <div className="dashboard-header">
          <h1>My Wishlist ❤️</h1>
          <p>Your favourite food items.</p>
        </div>

        {loading && <h3>Loading...</h3>}

        {!loading && wishlist.length === 0 && (
          <div className="empty-box">
            <h2>No favourite food</h2>
            <p>Add food to wishlist.</p>
          </div>
        )}

        <div className="food-grid">
          {wishlist.map((item) => (
            <div className="food-card" key={item.wishlist_id}>
              <img
                src={
                  item.food?.image
                    ? `${API_URL}${item.food.image}`
                    : 'https://placehold.co/400x250?text=Food'
                }
                alt={item.food?.food_name}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x250?text=Food';
                }}
              />

              <div className="food-body">
                <h3>{item.food?.food_name}</h3>

                <p>{item.food?.description}</p>

                <h2>₹{item.food?.price}</h2>

                <div className="wishlist-actions">

                  <button
                    onClick={() => addToCart(item.food.food_id)}
                  >
                    Add To Cart
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      removeWishlist(item.food.food_id)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Wishlist;