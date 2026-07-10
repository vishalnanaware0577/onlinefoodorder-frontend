import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function Review() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!order) {
    navigate('/my-orders');
    return null;
  }

  const submitReview = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.warning('Please select rating');
      return;
    }

    try {
      setLoading(true);

      await api.post('/reviews', {
        order_id: order.order_id,
        rating,
        comment
      });

      toast.success('Review submitted successfully');
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review submit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="review-page">
        <div className="review-card">
          <h1>Give Review</h1>
          <p>Share your experience about this order.</p>

          <div className="review-order-box">
            <h3>Order #{order.order_id}</h3>
            <span>{order.restaurant?.restaurant_name}</span>
          </div>

          <form onSubmit={submitReview}>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={star <= rating ? 'star active-star' : 'star'}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea
              rows="5"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Review;