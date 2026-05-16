import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

// Lazy load pages for better mobile performance
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const About = lazy(() => import('./pages/About'));
const Support = lazy(() => import('./pages/Support'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const CustomOrder = lazy(() => import('./pages/CustomOrder'));
const LoyaltyHistory = lazy(() => import('./pages/LoyaltyHistory'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Crafting Experience...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      setIsAuthLoading(true);
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup' &&
        window.location.pathname !== '/forgot-password' &&
        !window.location.pathname.startsWith('/reset-password') &&
        window.location.pathname !== '/' &&
        window.location.pathname !== '/shop' &&
        window.location.pathname !== '/track-order' &&
        !window.location.pathname.startsWith('/product/') &&
        !window.location.pathname.startsWith('/policy/') &&
        window.location.pathname !== '/about' &&
        window.location.pathname !== '/support' &&
        window.location.pathname !== '/blogs' &&
        !window.location.pathname.startsWith('/blog/')
      ) {
        navigate('/login');
      }
      setIsAuthLoading(false);
    };
    authenticate();
  }, [checkAuth, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-primary-600"></div>
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sticky header stack */}
      <div className="sticky top-0 z-50">
        <Navbar />
        <CategoryBar />
      </div>
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
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
        </Suspense>
      </main>
      <Footer />
      <ChatBot />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #E0E7FF',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(79,70,229,0.12)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#4F46E5', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#F43F5E', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  );
}

export default App;