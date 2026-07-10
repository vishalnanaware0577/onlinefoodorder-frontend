import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'customer'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobile || !form.password || !form.role) {
      toast.warning('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/register', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));

      toast.success('User successfully registered');

      const role = res.data.data.role;

      if (role === 'customer') navigate('/customer');
      else if (role === 'hotel_owner') navigate('/hotel-owner');
      else if (role === 'delivery_partner') navigate('/delivery');
      else navigate('/login');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <h2>Create Account</h2>
          <p>Register as Customer, Hotel Owner or Delivery Partner</p>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="hotel_owner">Hotel Owner</option>
              <option value="delivery_partner">Delivery Partner</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <h4>
            Already have an account? <Link to="/login">Login</Link>
          </h4>
        </motion.div>
      </section>
    </>
  );
}

export default Register;