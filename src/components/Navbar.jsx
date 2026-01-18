import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, HeartIcon, StarIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-bronze z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/silaimartlogo.png" alt="SilaiMart" className="h-20 sm:h-28 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-bronze">Home</Link>
            <Link to="/shop" className="text-white hover:text-bronze">Shop</Link>
            <Link to="/blogs" className="text-white hover:text-bronze">Blogs</Link>
            <Link to="/about" className="text-white hover:text-bronze">About</Link>
            <Link to="/support" className="text-white hover:text-bronze">Support</Link>
            <Link to="/custom-order" className="text-white hover:text-bronze">Custom Order</Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <Link to="/profile?tab=loyalty" className="relative group hidden sm:block">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-bronze/20 to-gold/20 border border-bronze/30 rounded-full hover:from-bronze/30 hover:to-gold/30 transition-all duration-300">
                  <StarIcon className="h-5 w-5 text-bronze" />
                  <span className="text-bronze font-semibold text-sm">
                    {user.loyaltyPoints || 0}
                  </span>
                  <span className="hidden sm:block text-bronze text-xs">pts</span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <GiftIcon className="h-4 w-4 text-bronze" />
                      <span className="text-bronze font-semibold text-sm">Loyalty Program</span>
                    </div>
                    <p className="text-gray-300 text-xs">You have {user.loyaltyPoints || 0} points</p>
                    <p className="text-gray-400 text-xs">= ₹{user.loyaltyPoints || 0} discount</p>
                  </div>
                  <div className="p-2">
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Earn 1 point per ₹10 spent</p>
                      <p>• 1 point = ₹1 discount</p>
                      <p>• Use during checkout</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            <Link to="/wishlist" className="relative p-2 text-white hover:text-bronze">
              <HeartIcon className="h-5 sm:h-6 w-5 sm:w-6" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {getWishlistCount()}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="relative p-2 text-white hover:text-bronze">
              <ShoppingCartIcon className="h-5 sm:h-6 w-5 sm:w-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-bronze text-black text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-bronze">
                  <UserIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                  <span className="hidden lg:block">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/orders" className="block px-4 py-2 text-white hover:bg-gray-800">My Orders</Link>
                  <Link to="/loyalty-history" className="block px-4 py-2 text-white hover:bg-gray-800">Loyalty History</Link>
                  <Link to="/profile" className="block px-4 py-2 text-white hover:bg-gray-800">My Profile</Link>
                  <Link to="/notifications" className="block px-4 py-2 text-white hover:bg-gray-800">Notifications</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-white hover:text-bronze">
                <UserIcon className="h-5 sm:h-6 w-5 sm:w-6" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1 text-white hover:text-bronze"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && (
                <Link to="/profile?tab=loyalty" className="flex items-center justify-between px-3 py-2 text-bronze hover:bg-gray-800 rounded">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5" />
                    <span>Loyalty Points</span>
                  </div>
                  <span className="font-semibold">{user.loyaltyPoints || 0} pts</span>
                </Link>
              )}
              <Link to="/" className="block px-3 py-2 text-white hover:text-bronze">Home</Link>
              <Link to="/shop" className="block px-3 py-2 text-white hover:text-bronze">Shop</Link>
              <Link to="/blogs" className="block px-3 py-2 text-white hover:text-bronze">Blogs</Link>
              <Link to="/about" className="block px-3 py-2 text-white hover:text-bronze">About</Link>
              <Link to="/support" className="block px-3 py-2 text-white hover:text-bronze">Support</Link>
              <Link to="/custom-order" className="block px-3 py-2 text-white hover:text-bronze">Custom Order</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;