import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function HotelOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get('/orders/hotel/my');

      setOrders(res.data.data || []);
      setFilteredOrders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hotel orders fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/hotel/status/${orderId}`, {
        order_status: status
      });

      if (status === 'accepted') toast.success('Order accepted successfully');
      if (status === 'preparing') toast.success('Order preparing started');
      if (status === 'ready') toast.success('Order ready for pickup');
      if (status === 'cancelled') toast.success('Order cancelled');

      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  const getActionButtons = (order) => {
    if (order.order_status === 'placed') {
      return (
        <>
          <button onClick={() => updateStatus(order.order_id, 'accepted')}>
            Accept
          </button>

          <button
            className="delete-btn"
            onClick={() => updateStatus(order.order_id, 'cancelled')}
          >
            Reject
          </button>
        </>
      );
    }

    if (order.order_status === 'accepted') {
      return (
        <button onClick={() => updateStatus(order.order_id, 'preparing')}>
          Start Preparing
        </button>
      );
    }

    if (order.order_status === 'preparing') {
      return (
        <button onClick={() => updateStatus(order.order_id, 'ready')}>
          Mark Ready
        </button>
      );
    }

    if (order.order_status === 'ready') {
      return <button disabled>Waiting For Delivery Partner</button>;
    }

    if (order.order_status === 'picked_up') {
      return <button disabled>Out For Delivery</button>;
    }

    if (order.order_status === 'delivered') {
      return <button disabled>Delivered</button>;
    }

    if (order.order_status === 'cancelled') {
      return <button disabled>Cancelled</button>;
    }

    return null;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let data = [...orders];

    if (search.trim()) {
      data = data.filter(
        (order) =>
          String(order.order_id).includes(search) ||
          order.restaurant?.restaurant_name
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter((order) => order.order_status === statusFilter);
    }

    setFilteredOrders(data);
  }, [search, statusFilter, orders]);

  return (
    <>
      <Navbar />

      <section className="premium-orders-page">
        <div className="section-title">
          <h2>Hotel Orders 📦</h2>
          <p>Manage customer orders and update order status.</p>
        </div>

        <div className="orders-filter-box">
          <input
            type="text"
            placeholder="Search order id or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
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
            <p>Customer orders will appear here.</p>
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
                  <span>Total</span>
                  <b>₹{order.total_amount}</b>
                </div>

                <div>
                  <span>Payment</span>
                  <b>{order.payment_status}</b>
                </div>

                <div>
                  <span>Method</span>
                  <b>{order.payment_method}</b>
                </div>
              </div>

              <div className="hotel-order-address">
                <h4>Delivery Address</h4>
                <p>{order.delivery_address}</p>
              </div>

              <div className="premium-order-actions">
                {getActionButtons(order)}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default HotelOrders;