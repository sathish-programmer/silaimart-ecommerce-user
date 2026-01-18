import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Notifications from './pages/Notifications';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import PolicyPage from './pages/PolicyPage';
import About from './pages/About';
import Support from './pages/Support';
import UserProfile from './pages/UserProfile';
import CustomOrder from './pages/CustomOrder';
import LoyaltyHistory from './pages/LoyaltyHistory';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { checkAuth, user } = useAuthStore();
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      setIsAuthLoading(true);
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/forgot-password' && !window.location.pathname.startsWith('/reset-password')) {
        navigate('/login');
      }
      setIsAuthLoading(false);
    };
    authenticate();
  }, [checkAuth, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Protected Routes */} 
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<Orders />} />
          <Route path="/loyalty-history" element={<LoyaltyHistory />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/policy/:type" element={<PolicyPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/custom-order" element={<CustomOrder />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #CD7F32'
          }
        }}
      />
    </div>
  );
}

export default App;