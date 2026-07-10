import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.warning('Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/login', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));

      toast.success('Login successful');

      const role = res.data.data.role;

      if (role === 'customer') navigate('/customer');
      else if (role === 'hotel_owner') navigate('/hotel-owner');
      else if (role === 'delivery_partner') navigate('/delivery');
      else navigate('/');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="auth-page">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>Welcome Back</h2>
          <p>Login to continue your food journey</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <h4>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </h4>
        </motion.div>
      </section>
    </>
  );
}

export default Login;