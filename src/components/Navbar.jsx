import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  StarIcon,
  IdentificationIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  TruckIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import NotificationCenter from './NotificationCenter';

/* ── Location Modal ──────────────────────────────────────────── */
const CITIES = [
  'Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad',
  'Coimbatore', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur',
];

const LocationModal = ({ onClose, onSelect, current }) => {
  const [query, setQuery] = useState('');
  const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-start justify-center pt-[120px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Select Delivery Location</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Search city..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <div className="py-2 max-h-60 overflow-y-auto">
          {filtered.map(city => (
            <button
              key={city}
              onClick={() => { onSelect(city); onClose(); }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                {city}
              </div>
              {current === city && <CheckIcon className="h-4 w-4 text-primary-600" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">No results for "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Navbar ──────────────────────────────────────────────────── */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState(() => localStorage.getItem('deliveryCity') || '');

  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const accountRef = useRef(null);
  const moreRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setShowAccountMenu(false);
    setShowMoreMenu(false);
  }, [routerLocation]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleCitySelect = (city) => {
    setLocation(city);
    localStorage.setItem('deliveryCity', city);
  };

  const cartCount = getItemCount();
  const wishCount = getWishlistCount?.() || 0;

  return (
    <>
      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSelect={handleCitySelect}
          current={location}
        />
      )}

      <nav className="bg-white border-b border-gray-200">
        {/* ── Top utility bar ── */}
        <div className="bg-gray-900 text-gray-400 text-[10px] font-medium hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
            <span className="tracking-wide">Free Shipping on Orders above ₹25,000</span>
            <div className="flex items-center gap-5">
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
              <Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>
        </div>

        {/* ── Main navbar row ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/silaimartlogo.png" alt="SilaiMart" className="h-9 sm:h-12 w-auto" />
            </Link>

            {/* Delivery location — desktop */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex flex-col items-start justify-center min-w-[90px] px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">Deliver to</span>
              <span className="flex items-center gap-0.5 text-[11px] font-black text-gray-900 group-hover:text-primary-600 transition-colors mt-0.5">
                <MapPinIcon className="h-3 w-3 text-primary-600 flex-shrink-0" />
                {location || 'Select City'}
                <ChevronDownIcon className="h-2.5 w-2.5 text-gray-400 ml-0.5" />
              </span>
            </button>

            {/* Search bar — takes all remaining space */}
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for Sculptures, Home Decor and more..."
                className="w-full h-9 bg-gray-100 border border-gray-200 rounded-lg pl-4 pr-10 text-sm outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary-600 text-white rounded-md flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* ── Right icons ── */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">

              {/* Account */}
              <div className="relative" ref={accountRef}>
                {user ? (
                  <button
                    onClick={() => setShowAccountMenu(v => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-none">
                      <span className="text-[9px] text-gray-400 font-medium">Hello,</span>
                      <span className="text-[11px] font-black text-gray-900">{user.name?.split(' ')[0]}</span>
                    </div>
                    <ChevronDownIcon className={`h-3 w-3 text-gray-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-[11px] font-black hover:bg-black transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}

                {/* Account Dropdown */}
                {showAccountMenu && user && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5 truncate">{user.name}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { to: '/profile', icon: IdentificationIcon, label: 'My Profile' },
                        { to: '/orders', icon: ShoppingBagIcon, label: 'My Orders' },
                        { to: '/wishlist', icon: HeartIcon, label: 'Wishlist' },
                        { to: '/loyalty-history', icon: StarIcon, label: 'Rewards & Coins' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* More — desktop */}
              <div className="relative hidden lg:block" ref={moreRef}>
                <button
                  onClick={() => setShowMoreMenu(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[9px] text-gray-400 font-medium">Explore</span>
                    <span className="flex items-center gap-0.5 text-[11px] font-black text-gray-900">
                      More <ChevronDownIcon className={`h-2.5 w-2.5 text-gray-400 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                    {[
                      { to: '/notifications', icon: BellIcon, label: 'Notifications' },
                      { to: '/support', icon: PhoneIcon, label: 'Customer Care' },
                      { to: '/about', icon: QuestionMarkCircleIcon, label: 'About Us' },
                      { to: '/track-order', icon: TruckIcon, label: 'Track Order' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist — desktop */}
              {user && (
                <Link
                  to="/wishlist"
                  className="relative hidden sm:flex flex-col items-center justify-center px-2.5 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="relative">
                    <HeartIcon className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                    {wishCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                        {wishCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 group-hover:text-primary-600 mt-0.5 hidden lg:block">Wishlist</span>
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex flex-col items-center justify-center px-2.5 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-500 group-hover:text-primary-600 mt-0.5 hidden sm:block">Cart</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {isOpen ? <XMarkIcon className="h-5 w-5 text-gray-700" /> : <Bars3Icon className="h-5 w-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-9 bg-gray-100 border border-gray-200 rounded-lg pl-4 pr-10 text-sm outline-none focus:border-primary-500"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary-600 text-white rounded-md flex items-center justify-center">
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] md:hidden" onClick={() => setIsOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-primary-600 p-5 flex items-center gap-3">
                <div className="h-11 w-11 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-black">
                  {user ? user.name?.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{user ? user.name : 'Welcome, Guest'}</p>
                  <p className="text-primary-200 text-xs">{user ? user.email : 'Login for a better experience'}</p>
                </div>
              </div>

              {/* Location */}
              <button
                onClick={() => { setIsOpen(false); setShowLocationModal(true); }}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <MapPinIcon className="h-4 w-4 text-primary-600" />
                {location ? `Delivering to ${location}` : 'Select Delivery Location'}
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400 ml-auto" />
              </button>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto py-2">
                {[
                  { to: '/', icon: HomeIcon, label: 'Home' },
                  { to: '/shop', icon: ShoppingBagIcon, label: 'All Products' },
                  { to: '/orders', icon: ShoppingBagIcon, label: 'My Orders' },
                  { to: '/wishlist', icon: HeartIcon, label: 'Wishlist' },
                  { to: '/notifications', icon: BellIcon, label: 'Notifications' },
                  { to: '/track-order', icon: TruckIcon, label: 'Track Order' },
                  { to: '/support', icon: PhoneIcon, label: 'Customer Support' },
                ].map(item => (
                  <Link key={item.to} to={item.to} className="flex items-center gap-4 px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100">
                {!user ? (
                  <Link to="/login" className="flex items-center justify-center bg-primary-600 text-white py-3 rounded-xl font-black text-sm w-full">
                    Login / Sign Up
                  </Link>
                ) : (
                  <button onClick={handleLogout} className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm">
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;