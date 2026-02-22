import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (user) fetchWishlist();
    else navigate('/login');
  }, [user, fetchWishlist, navigate]);

  const handleAddToCart = (product) => { addItem(product, 1); toast.success('Added to cart'); };
  const handleRemove = (productId) => { removeFromWishlist(productId); setSelectedItems(p => p.filter(id => id !== productId)); };
  const toggleSelect = (id) => setSelectedItems(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const selectAll = () => setSelectedItems(selectedItems.length === wishlist.length ? [] : wishlist.map(i => i._id));

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 text-sm mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          {wishlist.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={selectAll} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {selectedItems.length === wishlist.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedItems.length > 0 && (
                <>
                  <button onClick={() => { selectedItems.forEach(id => { const p = wishlist.find(i => i._id === id); if (p) addItem(p, 1); }); toast.success(`Added ${selectedItems.length} items to cart`); setSelectedItems([]); }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                    Add Selected ({selectedItems.length})
                  </button>
                  <button onClick={() => { selectedItems.forEach(id => removeFromWishlist(id)); setSelectedItems([]); }}
                    className="bg-secondary-50 text-secondary-600 border border-secondary-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-secondary-100 transition-colors">
                    Remove Selected
                  </button>
                </>
              )}
              <button onClick={clearWishlist} className="text-secondary-500 hover:text-secondary-600 text-sm font-medium transition-colors">Clear All</button>
            </div>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-12 w-12 text-violet-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-8">Save items you love to buy them later</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {wishlist.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-300 group relative">
                  {/* Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input type="checkbox" checked={selectedItems.includes(product._id)} onChange={() => toggleSelect(product._id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  </div>

                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-violet-50">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HeartSolid className="h-10 w-10 text-violet-200" />
                      </div>
                    )}
                    {product.discountPrice && (
                      <div className="absolute top-3 right-3 bg-secondary-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Link to={`/product/${product._id}`} className="bg-white rounded-full p-2.5 hover:bg-gray-100 transition-colors">
                        <EyeIcon className="h-4 w-4 text-gray-700" />
                      </Link>
                      <button onClick={() => handleAddToCart(product)} className="bg-primary-600 rounded-full p-2.5 hover:bg-primary-700 transition-colors">
                        <ShoppingCartIcon className="h-4 w-4 text-white" />
                      </button>
                      <button onClick={() => handleRemove(product._id)} className="bg-secondary-500 rounded-full p-2.5 hover:bg-secondary-600 transition-colors">
                        <TrashIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {product.category?.name && <span className="text-xs text-primary-500 font-medium uppercase tracking-wide">{product.category.name}</span>}
                    <h3 className="text-gray-900 font-semibold text-sm mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-primary-600 font-bold">₹{(product.discountPrice || product.price)?.toLocaleString()}</span>
                      {product.discountPrice && <span className="text-gray-400 line-through text-xs">₹{product.price?.toLocaleString()}</span>}
                    </div>
                    <div className="mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.stock > 10 ? 'bg-green-50 text-green-700' :
                          product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                        }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddToCart(product)} disabled={product.stock === 0}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                        Add to Cart
                      </button>
                      <button onClick={() => handleRemove(product._id)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-secondary-500 hover:border-secondary-200 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to purchase?</h3>
                <p className="text-gray-500 text-sm">Add all items to cart and checkout</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { wishlist.forEach(p => handleAddToCart(p)); }}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm">
                  Add All to Cart
                </button>
                <Link to="/shop" className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
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