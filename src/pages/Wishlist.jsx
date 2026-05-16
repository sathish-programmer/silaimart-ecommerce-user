import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, TrashIcon, EyeIcon, SparklesIcon, CheckBadgeIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon } from '@heroicons/react/24/solid';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Wishlist = () => {
  const { wishlist, loading, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchSettings();
    } else {
      navigate('/login');
    }
  }, [user, fetchWishlist, navigate]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings/public`);
      setSettings(res.data?.settings);
    } catch (err) { console.error('Error fetching settings:', err); }
  };

  const handleAddToCart = (product) => { 
    addItem(product, 1); 
    toast.success('Added to your cart!'); 
  };

  const handleRemove = (productId) => { 
    removeFromWishlist(productId); 
    setSelectedItems(p => p.filter(id => id !== productId)); 
    toast.success('Removed from wishlist');
  };

  const toggleSelect = (id) => setSelectedItems(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const selectAll = () => setSelectedItems(selectedItems.length === wishlist.length ? [] : wishlist.map(i => i._id));

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Your Masterpieces...</p>
        </div>
      </div>
    );
  }

  // Calculate Wishlist Stats
  const totalValue = wishlist.reduce((sum, item) => sum + (item.discountPrice || item.price || 0), 0);
  const inStockCount = wishlist.filter(item => item.stock > 0).length;

  return (
    <div className="min-h-screen bg-stone-50 py-12 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Modern Hero Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mb-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <SparklesIcon className="h-4 w-4 text-primary-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-200">Curated Collection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
                My Wishlist
              </h1>
              <p className="text-stone-300 text-sm sm:text-base font-medium">
                Your personal vault of favorite designs, exquisite fabrics, and premium art pieces.
              </p>
            </div>

            {/* Quick Stats Glass Card */}
            {wishlist.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Saved Value</p>
                  <p className="text-2xl sm:text-3xl font-black text-primary-400 mt-0.5">₹{totalValue.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Items</p>
                  <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">{wishlist.length}</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Available Now</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">{inStockCount}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar & Bulk Actions */}
        {wishlist.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={selectAll} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                  selectedItems.length === wishlist.length 
                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg' 
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedItems.length > 0 && selectedItems.length === wishlist.length} 
                  onChange={() => {}} 
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 pointer-events-none"
                />
                {selectedItems.length === wishlist.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedItems.length > 0 && (
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100">
                  {selectedItems.length} Selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedItems.length > 0 && (
                <>
                  <button 
                    onClick={() => { 
                      selectedItems.forEach(id => { const p = wishlist.find(i => i._id === id); if (p) addItem(p, 1); }); 
                      toast.success(`Added ${selectedItems.length} items to cart!`); 
                      setSelectedItems([]); 
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Add Selected to Cart
                  </button>
                  <button 
                    onClick={() => { selectedItems.forEach(id => removeFromWishlist(id)); setSelectedItems([]); }}
                    className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all active:scale-95"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove Selected
                  </button>
                </>
              )}
              <button 
                onClick={clearWishlist} 
                className="text-stone-400 hover:text-stone-600 text-xs font-black uppercase tracking-wider px-4 py-2.5 transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm p-8 max-w-xl mx-auto">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-inner">
              <HeartSolid className="h-12 w-12 text-rose-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your Wishlist is Empty</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed">
              Explore our boutique and save your favorite styles, luxurious fabrics, and handcrafted designs to view or purchase them later.
            </p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-xs uppercase tracking-widest font-black shadow-lg shadow-primary-200">
              <SparklesIcon className="h-4 w-4" />
              Discover Masterpieces
            </Link>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => {
                const itemPrice = product.discountPrice || product.price;
                const itemOrigPrice = product.price || itemPrice;
                const itemDiscountPct = itemOrigPrice > itemPrice ? Math.round(((itemOrigPrice - itemPrice) / itemOrigPrice) * 100) : 0;
                const itemWowPrice = settings?.offers?.wowDeal?.enabled ? Math.round(itemPrice * (1 - (settings.offers.wowDeal.discountPercentage || 15) / 100)) : itemPrice;
                const superCoinDiscount = settings?.offers?.superCoin?.enabled ? settings.offers.superCoin.pointsDiscount : 0;

                return (
                  <div 
                    key={product._id} 
                    className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border transition-all duration-500 group relative flex flex-col ${
                      selectedItems.includes(product._id) 
                        ? 'border-primary-500 ring-2 ring-primary-100 shadow-xl' 
                        : 'border-stone-200/80 hover:border-stone-300 hover:shadow-2xl hover:-translate-y-1.5'
                    }`}
                  >
                    {/* Top Checkbox Overlay */}
                    <div className="absolute top-4 left-4 z-20">
                      <button 
                        onClick={() => toggleSelect(product._id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                          selectedItems.includes(product._id)
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-110'
                            : 'bg-white/80 backdrop-blur-md border-stone-300 text-transparent hover:border-stone-400'
                        }`}
                      >
                        <CheckBadgeIcon className="h-5 w-5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 items-end">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-md ${
                        product.stock > 10 
                          ? 'bg-emerald-500/90 text-white border border-emerald-400/30' 
                          : product.stock > 0 
                          ? 'bg-amber-500/90 text-white border border-amber-400/30 animate-pulse' 
                          : 'bg-rose-500/90 text-white border border-rose-400/30'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} Left` : 'Sold Out'}
                      </span>
                      {itemOrigPrice > itemPrice && (
                        <span className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md">
                          {itemDiscountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                      {product.images?.[0]?.url ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HeartSolid className="h-12 w-12 text-stone-200" />
                        </div>
                      )}

                      {/* Glassmorphism Action Overlay */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10">
                        <Link 
                          to={`/product/${product._id}`} 
                          className="p-3.5 bg-white/90 hover:bg-white text-stone-900 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
                          title="Quick View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="p-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                          title="Add to Cart"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleRemove(product._id)} 
                          className="p-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
                          title="Remove from Wishlist"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        {product.category?.name && (
                          <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-2.5 py-1 rounded-lg">
                            {product.category.name}
                          </span>
                        )}
                        <Link to={`/product/${product._id}`} className="block">
                          <h3 className="text-gray-900 font-bold text-sm line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-black text-stone-900 tracking-tight">
                            ₹{itemPrice.toLocaleString()}
                          </span>
                          {itemOrigPrice > itemPrice && (
                            <span className="text-xs text-gray-400 line-through font-bold">
                              ₹{itemOrigPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Dynamic Flipkart Offers Tags */}
                        {settings?.offers && (
                          <div className="space-y-1.5 pt-2 border-t border-stone-100">
                            {settings.offers.wowDeal?.enabled && (
                              <div className="bg-blue-50 text-blue-700 text-[9px] font-black px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                                <SparklesIcon className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span>WOW! Buy at ₹{itemWowPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {settings.offers.superCoin?.enabled && (
                              <div className="bg-amber-50 text-amber-700 text-[9px] font-black px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
                                <span>🪙 Or Pay ₹{Math.max(0, itemPrice - superCoinDiscount).toLocaleString()} + {settings.offers.superCoin.coinsRequired} Coins</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => handleAddToCart(product)} 
                          disabled={product.stock === 0}
                          className="flex-1 bg-stone-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl active:scale-95 disabled:bg-stone-100 disabled:text-stone-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                          <ShoppingCartIcon className="h-4 w-4" />
                          {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
                        </button>
                        <button 
                          onClick={() => handleRemove(product._id)} 
                          className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
                          title="Remove"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Recommendation CTA */}
            <div className="mt-16 bg-gradient-to-r from-primary-600 to-amber-600 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10 space-y-2 max-w-xl text-center md:text-left">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 inline-block">
                  Concierge Recommendation
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Ready to Elevate Your Wardrobe?</h3>
                <p className="text-primary-100 text-sm sm:text-base font-medium">
                  Transfer your entire wishlist to your shopping cart in one click and enjoy seamless, insured express delivery.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-4 w-full md:w-auto justify-center">
                <button 
                  onClick={() => { wishlist.forEach(p => handleAddToCart(p)); toast.success('All items added to cart!'); }}
                  className="bg-stone-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  Add All to Cart
                </button>
                <Link 
                  to="/shop" 
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Wishlist;