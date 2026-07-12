import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';
function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableOrders = async () => {
    try {
      const res = await api.get('/orders/delivery/available');
      setAvailableOrders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Available orders fetch failed');
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get('/orders/delivery/my');
      setMyOrders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'My deliveries fetch failed');
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      await fetchAvailableOrders();
      await fetchMyOrders();
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.patch(`/orders/delivery/accept/${orderId}`);
      toast.success('Delivery accepted successfully');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Accept delivery failed');
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.patch(`/orders/delivery/delivered/${orderId}`);
      toast.success('Order delivered successfully');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delivered update failed');
    }
  };

  useEffect(() => {
    fetchAll();

const socket = io(API_URL);

    socket.on('new-delivery-order', () => {
      toast.info('New delivery order available');
      fetchAvailableOrders();
    });

    return () => socket.disconnect();
  }, []);

  const completed = myOrders.filter((item) => item.order_status === 'delivered').length;
  const active = myOrders.filter((item) => item.order_status !== 'delivered').length;
  const earnings = myOrders
    .filter((item) => item.order_status === 'delivered')
    .reduce((sum, item) => sum + Math.round(Number(item.total_amount || 0) * 0.08), 0);

  return (
    <>
      <Navbar />

      <section className="delivery-page">
        <div className="section-title">
          <h2>Delivery Dashboard 🚴</h2>
          <p>Accept ready orders and complete deliveries.</p>
        </div>

        {loading && <h3>Loading delivery dashboard...</h3>}

        <div className="delivery-stats">
          <motion.div whileHover={{ y: -6 }}>
            <h2>{availableOrders.length}</h2>
            <p>Available Orders</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }}>
            <h2>{active}</h2>
            <p>Active Deliveries</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }}>
            <h2>{completed}</h2>
            <p>Completed</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }}>
            <h2>₹{earnings}</h2>
            <p>Earnings</p>
          </motion.div>
        </div>

        <div className="section-title small-header">
          <h2>Available Orders</h2>
          <p>Orders marked ready by hotels will appear here.</p>
        </div>

        {availableOrders.length === 0 && (
          <div className="empty-box">
            <h2>No available orders</h2>
            <p>Please wait for hotel owners to mark orders ready.</p>
          </div>
        )}

        <div className="delivery-grid">
          {availableOrders.map((order) => (
            <motion.div
              className="delivery-card"
              key={order.order_id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="delivery-top">
                <div>
                  <h3>Order #{order.order_id}</h3>
                  <p>{order.restaurant?.restaurant_name}</p>
                </div>

                <span className="order-status ready">{order.order_status}</span>
              </div>

              <div className="delivery-items">
                {order.items?.map((item) => (
                  <p key={item.order_item_id}>
                    {item.food_name} x {item.quantity}
                  </p>
                ))}
              </div>

              <div className="delivery-info">
                <p><b>Pickup:</b> {order.restaurant?.city || 'Restaurant'}</p>
                <p><b>Drop:</b> {order.delivery_address}</p>
                <p><b>Total:</b> ₹{order.total_amount}</p>
                <p><b>Payment:</b> {order.payment_method}</p>
              </div>

              <button onClick={() => acceptOrder(order.order_id)}>
                Accept Delivery
              </button>
            </motion.div>
          ))}
        </div>

        <div className="section-title small-header">
          <h2>My Deliveries</h2>
          <p>Your accepted and completed delivery orders.</p>
        </div>

        {myOrders.length === 0 && (
          <div className="empty-box">
            <h2>No deliveries accepted</h2>
          </div>
        )}

        <div className="delivery-grid">
          {myOrders.map((order) => (
            <motion.div
              className="delivery-card"
              key={order.order_id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="delivery-top">
                <div>
                  <h3>Order #{order.order_id}</h3>
                  <p>{order.restaurant?.restaurant_name}</p>
                </div>

                <span className={`order-status ${order.order_status}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="delivery-items">
                {order.items?.map((item) => (
                  <p key={item.order_item_id}>
                    {item.food_name} x {item.quantity}
                  </p>
                ))}
              </div>

              <div className="delivery-info">
                <p><b>Drop:</b> {order.delivery_address}</p>
                <p><b>Total:</b> ₹{order.total_amount}</p>
                <p><b>Payment:</b> {order.payment_status}</p>
                <p><b>Your Earning:</b> ₹{Math.round(Number(order.total_amount || 0) * 0.08)}</p>
              </div>

              {order.order_status !== 'delivered' ? (
                <button onClick={() => markDelivered(order.order_id)}>
                  Mark Delivered
                </button>
              ) : (
                <button disabled>Completed</button>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default DeliveryDashboard;