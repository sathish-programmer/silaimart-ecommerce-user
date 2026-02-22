import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, HeartIcon, StarIcon, GiftIcon, TruckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-200 ${isActive(path)
      ? 'text-primary-600'
      : 'text-gray-600 hover:text-primary-600'
    }`;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-white border-b border-gray-100'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 -ml-4">
              <img src="/silaimartlogo.png" alt="SilaiMart" className="w-auto" style={{ height: '11.5rem', marginTop: '15px' }} />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={navLinkClass('/')}>
                Home
                {isActive('/') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
              </Link>
              <Link to="/shop" className={navLinkClass('/shop')}>
                Shop
                {isActive('/shop') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
              </Link>
              <Link to="/blogs" className={navLinkClass('/blogs')}>
                Blogs
                {isActive('/blogs') && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Loyalty Points */}
              {user && (
                <Link to="/profile?tab=loyalty" className="relative group hidden sm:block">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full hover:bg-primary-100 transition-all duration-200">
                    <StarIcon className="h-4 w-4 text-accent-500" />
                    <span className="text-primary-700 font-semibold text-sm">{user.loyaltyPoints || 0}</span>
                    <span className="text-primary-500 text-xs font-medium">pts</span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="h-8 w-8 bg-accent-100 rounded-full flex items-center justify-center">
                        <GiftIcon className="h-4 w-4 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">Loyalty Program</p>
                        <p className="text-gray-400 text-xs">{user.loyaltyPoints || 0} points = ₹{user.loyaltyPoints || 0}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 border-t border-gray-50 pt-3">
                      <p>• Earn 1 point per ₹10 spent</p>
                      <p>• 1 point = ₹1 discount</p>
                      <p>• Use during checkout</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all duration-200">
                <HeartIcon className="h-5 w-5" />
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-secondary-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all duration-200">
                <ShoppingCartIcon className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              {user && <NotificationDropdown />}

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-200">
                    <div className="h-7 w-7 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="hidden lg:block text-sm font-medium">{user.name?.split(' ')[0]}</span>
                    <ChevronDownIcon className="hidden lg:block h-3 w-3 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">My Orders</Link>
                    <Link to="/loyalty-history" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Loyalty History</Link>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">My Profile</Link>
                    <Link to="/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Notifications</Link>
                    <div className="border-t border-gray-100 my-1" />
                    <Link to="/track-order" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                      <TruckIcon className="h-4 w-4 mr-2" /> Track Order
                    </Link>
                    <Link to="/custom-order" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Custom Order</Link>
                    <Link to="/about" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">About</Link>
                    <Link to="/support" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Support</Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors font-medium">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center space-x-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm">
                  <UserIcon className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all duration-200"
              >
                {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-4 pt-3 pb-4 space-y-1">
                {user && (
                  <Link to="/profile?tab=loyalty" className="flex items-center justify-between px-3 py-2.5 text-primary-700 bg-primary-50 rounded-xl mb-2">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-4 w-4 text-accent-500" />
                      <span className="text-sm font-medium">Loyalty Points</span>
                    </div>
                    <span className="text-sm font-bold">{user.loyaltyPoints || 0} pts</span>
                  </Link>
                )}
                {[
                  { to: '/', label: 'Home' },
                  { to: '/shop', label: 'Shop' },
                  { to: '/blogs', label: 'Blogs' },
                  { to: '/about', label: 'About' },
                  { to: '/support', label: 'Support' },
                  { to: '/custom-order', label: 'Custom Order' },
                  { to: '/track-order', label: 'Track Order' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(to) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {label}
                  </Link>
                ))}
                {!user && (
                  <Link to="/login" className="block mt-2 px-3 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold text-center">
                    Login / Sign Up
                  </Link>
                )}
                {user && (
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-secondary-600 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors mt-1">
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;