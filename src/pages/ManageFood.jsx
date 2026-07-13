import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';

function ManageFood() {
  const { restaurantId } = useParams();

  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);

  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('all');

  const [form, setForm] = useState({
    food_name: '',
    description: '',
    price: '',
    food_type: 'veg',
    image: null
  });

  const fetchFoods = async () => {
    try {
      const res = await api.get(`/food/restaurant/${restaurantId}`);
      setFoods(res.data.data || []);
      setFilteredFoods(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Food fetch failed');
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addFood = async (e) => {
    e.preventDefault();

    if (!form.food_name || !form.price || !form.food_type) {
      toast.warning('Please fill food name, price and type');
      return;
    }

    try {
      const data = new FormData();

      data.append('restaurant_id', restaurantId);
      data.append('food_name', form.food_name);
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('food_type', form.food_type);

      if (form.image) {
        data.append('image', form.image);
      }

      await api.post('/food', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Food item added successfully');

      setForm({
        food_name: '',
        description: '',
        price: '',
        food_type: 'veg',
        image: null
      });

      fetchFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Food add failed');
    }
  };

  const deleteFood = async (foodId) => {
    try {
      await api.delete(`/food/${foodId}`);
      toast.success('Food deleted successfully');
      fetchFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Food delete failed');
    }
  };

  const toggleAvailability = async (foodId) => {
    try {
      await api.patch(`/food/${foodId}/availability`);
      toast.success('Food availability updated');
      fetchFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Availability update failed');
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [restaurantId]);

  useEffect(() => {
    let data = [...foods];

    if (search.trim()) {
      data = data.filter((food) =>
        food.food_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (foodType !== 'all') {
      data = data.filter((food) => food.food_type === foodType);
    }

    setFilteredFoods(data);
  }, [search, foodType, foods]);

  return (
    <>
      <Navbar />

      <section className="owner-premium-page">
        <div className="section-title">
          <h2>Manage Food Menu 🍔</h2>
          <p>Add, manage and control food availability.</p>
        </div>

        <div className="owner-premium-layout">
          <div className="owner-form-card">
            <h2>Add Food Item</h2>

            <form onSubmit={addFood}>
              <input
                type="text"
                name="food_name"
                placeholder="Food Name"
                value={form.food_name}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Food Description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />

              <select
                name="food_type"
                value={form.food_type}
                onChange={handleChange}
              >
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
              </select>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

              <button type="submit">Add Food</button>
            </form>
          </div>

          <div className="owner-list-card">
            <h2>Food Items</h2>

            <div className="orders-filter-box">
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
            </div>

            {filteredFoods.length === 0 && (
              <div className="empty-box">
                <h3>No food items found</h3>
              </div>
            )}

            <div className="owner-food-list">
              {filteredFoods.map((food) => (
                <div className="owner-food-item" key={food.food_id}>
                  <img
                    src={
                      food.image
                        ? `${API_URL}${food.image}`
                        : 'https://placehold.co/140x100?text=Food'
                    }
                    alt={food.food_name}
                  />

                  <div>
                    <h3>{food.food_name}</h3>
                    <p>₹{food.price}</p>
                    <p>{food.food_type === 'veg' ? 'Veg' : 'Non-Veg'}</p>
                    <span
                      className={
                        food.is_available ? 'open-pill-small' : 'closed-pill-small'
                      }
                    >
                      {food.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="owner-actions">
                    <button
                      className="food-btn"
                      onClick={() => toggleAvailability(food.food_id)}
                    >
                      Toggle
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteFood(food.food_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ManageFood;