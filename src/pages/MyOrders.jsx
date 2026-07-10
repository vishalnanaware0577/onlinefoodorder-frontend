import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaBox, FaTruck, FaStar, FaRedo } from 'react-icons/fa';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      setOrders(res.data.data || []);
      setFilteredOrders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Orders fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/orders/cancel/${orderId}`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order cancel failed');
    }
  };

  const reorder = async (order) => {
    try {
      for (const item of order.items || []) {
        await api.post('/cart/add', {
          food_id: item.food_id,
          quantity: item.quantity
        });
      }

      toast.success('Items added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reorder failed');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let data = [...orders];

    if (filter !== 'all') {
      data = data.filter((order) => order.order_status === filter);
    }

    if (search.trim()) {
      data = data.filter(
        (order) =>
          String(order.order_id).includes(search) ||
          order.restaurant?.restaurant_name
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFilteredOrders(data);
  }, [filter, search, orders]);

  return (
    <>
      <Navbar />

      <section className="premium-orders-page">
        <div className="section-title">
          <h2>My Orders 📦</h2>
          <p>Track, review and reorder your food.</p>
        </div>

        <div className="orders-filter-box">
          <input
            type="text"
            placeholder="Search order id or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading && <h3>Loading orders...</h3>}

        {!loading && filteredOrders.length === 0 && (
          <div className="empty-box">
            <h2>No orders found</h2>
            <p>Your order history will show here.</p>
          </div>
        )}

        <div className="premium-orders-list">
          {filteredOrders.map((order) => (
            <motion.div
              className="premium-order-card"
              key={order.order_id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="premium-order-top">
                <div>
                  <h2>Order #{order.order_id}</h2>
                  <p>{order.restaurant?.restaurant_name || 'Restaurant'}</p>
                </div>

                <span className={`order-status ${order.order_status}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="premium-order-items">
                {order.items?.map((item) => (
                  <p key={item.order_item_id}>
                    {item.food_name} x {item.quantity}
                    <b> ₹{Number(item.price) * Number(item.quantity)}</b>
                  </p>
                ))}
              </div>

              <div className="premium-order-info">
                <div>
                  <FaBox />
                  <span>Payment</span>
                  <b>{order.payment_status}</b>
                </div>

                <div>
                  <FaTruck />
                  <span>Status</span>
                  <b>{order.order_status}</b>
                </div>

                <div>
                  <FaStar />
                  <span>Total</span>
                  <b>₹{order.total_amount}</b>
                </div>
              </div>

              <div className="premium-order-actions">
                <button
                  onClick={() => navigate('/track-order', { state: { order } })}
                >
                  Track Order
                </button>

                {['placed', 'accepted'].includes(order.order_status) && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(order.order_id)}
                  >
                    Cancel Order
                  </button>
                )}

                {['delivered', 'cancelled'].includes(order.order_status) && (
                  <button onClick={() => reorder(order)}>
                    <FaRedo /> Reorder
                  </button>
                )}

                {order.order_status === 'delivered' && !order.review && (
                  <button
                    onClick={() => navigate('/review', { state: { order } })}
                  >
                    Give Review
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default MyOrders;