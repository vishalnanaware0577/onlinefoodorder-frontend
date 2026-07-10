import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import HotelOwnerDashboard from './pages/HotelOwnerDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Review from './pages/Review';
import TrackOrder from './pages/TrackOrder';
import Notifications from './pages/Notifications';
import ManageFood from './pages/ManageFood';
import HotelOrders from './pages/HotelOrders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/:restaurantId/menu"
          element={
            <ProtectedRoute role="customer">
              <RestaurantMenu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute role="customer">
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute role="customer">
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute role="customer">
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute role="customer">
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute role="customer">
              <Review />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-order"
          element={
            <ProtectedRoute role="customer">
              <TrackOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute role="customer">
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-owner"
          element={
            <ProtectedRoute role="hotel_owner">
              <HotelOwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-owner/restaurant/:restaurantId/foods"
          element={
            <ProtectedRoute role="hotel_owner">
              <ManageFood />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-owner/orders"
          element={
            <ProtectedRoute role="hotel_owner">
              <HotelOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery"
          element={
            <ProtectedRoute role="delivery_partner">
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;