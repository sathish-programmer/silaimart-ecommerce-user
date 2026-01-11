import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
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
          <Link to="/" className="flex items-center">
            <img src="/silaimartlogo.png" alt="SilaiMart" className="h-28 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-bronze">Home</Link>
            <Link to="/shop" className="text-white hover:text-bronze">Shop</Link>
            <Link to="/blogs" className="text-white hover:text-bronze">Blogs</Link>
            <Link to="/about" className="text-white hover:text-bronze">About</Link>
            <Link to="/support" className="text-white hover:text-bronze">Support</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="relative p-2 text-white hover:text-bronze">
              <HeartIcon className="h-6 w-6" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="relative p-2 text-white hover:text-bronze">
              <ShoppingCartIcon className="h-6 w-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-bronze text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-bronze">
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden md:block">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/orders" className="block px-4 py-2 text-white hover:bg-gray-800">My Orders</Link>
                  <Link to="/notifications" className="block px-4 py-2 text-white hover:bg-gray-800">Notifications</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-white hover:text-bronze">
                <UserIcon className="h-6 w-6" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-bronze"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-white hover:text-bronze">Home</Link>
              <Link to="/shop" className="block px-3 py-2 text-white hover:text-bronze">Shop</Link>
              <Link to="/blogs" className="block px-3 py-2 text-white hover:text-bronze">Blogs</Link>
              <Link to="/about" className="block px-3 py-2 text-white hover:text-bronze">About</Link>
              <Link to="/support" className="block px-3 py-2 text-white hover:text-bronze">Support</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;