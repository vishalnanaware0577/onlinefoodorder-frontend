import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logout successful');
    navigate('/');
  };

  const fetchCounts = async () => {
    if (!user) return;

    try {
      const notiRes = await api.get('/notifications/my');
      const unread = (notiRes.data.data || []).filter((n) => !n.is_read).length;
      setUnreadCount(unread);

      if (user.role === 'customer') {
        const cartRes = await api.get('/cart/my');
        setCartCount(cartRes.data.data?.cart?.items?.length || 0);
      }
    } catch {
      // ignore count errors
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🍔 FoodOrder</Link>

      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">Sign Up</Link>
          </>
        )}

        {user && (
          <>
            {user.role === 'customer' && (
              <>
                <Link to="/customer">Restaurants</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">Cart {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}</Link>
                <Link to="/my-orders">My Orders</Link>
              </>
            )}

            {user.role === 'hotel_owner' && (
              <>
                <Link to="/hotel-owner">Dashboard</Link>
                <Link to="/hotel-owner/orders">Orders</Link>
              </>
            )}

            {user.role === 'delivery_partner' && (
              <Link to="/delivery">Dashboard</Link>
            )}

            <Link to="/notifications">
              Notifications {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </Link>

            <Link to="/profile">Profile</Link>

            <span className="welcome-user">{user.name}</span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;