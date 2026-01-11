import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  TrashIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
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
    if (user) {
      fetchWishlist();
    } else {
      navigate('/login');
    }
  }, [user, fetchWishlist, navigate]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart');
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map(item => item._id));
    }
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach(productId => {
      removeFromWishlist(productId);
    });
    setSelectedItems([]);
  };

  const handleAddSelectedToCart = () => {
    selectedItems.forEach(productId => {
      const product = wishlist.find(item => item._id === productId);
      if (product) {
        addItem(product, 1);
      }
    });
    toast.success(`Added ${selectedItems.length} items to cart`);
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Wishlist</h1>
            <p className="text-gray-400">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="text-bronze hover:text-gold transition-colors"
              >
                {selectedItems.length === wishlist.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={handleAddSelectedToCart}
                    className="bg-bronze text-black px-4 py-2 rounded-lg hover:bg-gold transition-colors"
                  >
                    Add Selected to Cart ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleRemoveSelected}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove Selected
                  </button>
                </>
              )}
              <button
                onClick={clearWishlist}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Save items you love to buy them later</p>
            <Link
              to="/shop"
              className="bg-bronze text-black px-6 py-3 rounded-xl font-semibold hover:bg-gold transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-700 hover:border-bronze/50">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(product._id)}
                    onChange={() => handleSelectItem(product._id)}
                    className="w-5 h-5 text-bronze bg-gray-800 border-gray-600 rounded focus:ring-bronze focus:ring-2"
                  />
                </div>

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Discount Badge */}
                  {product.discountPrice && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                      -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                    </div>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-3">
                      <Link
                        to={`/product/${product._id}`}
                        className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-bronze/80 backdrop-blur-sm text-black p-3 rounded-full hover:bg-bronze transition-colors"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="bg-red-600/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-bronze text-sm font-medium">{product.category?.name}</span>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2 group-hover:text-bronze transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-bronze font-bold text-lg">
                        ₹{(product.discountPrice || product.price).toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <HeartSolid className="h-4 w-4 text-red-500" />
                      <span className="text-gray-400 text-sm">Saved</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 10 ? 'bg-green-900/20 text-green-400' :
                      product.stock > 0 ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {product.stock > 10 ? 'In Stock' :
                       product.stock > 0 ? `Only ${product.stock} left` :
                       'Out of Stock'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-bronze text-black py-2 px-3 rounded-lg font-medium hover:bg-gold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Actions */}
        {wishlist.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to purchase?</h3>
                <p className="text-gray-400">Add all items to cart and checkout</p>
              </div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <button
                  onClick={() => {
                    wishlist.forEach(product => handleAddToCart(product));
                  }}
                  className="bg-bronze text-black px-6 py-3 rounded-xl font-semibold hover:bg-gold transition-colors"
                >
                  Add All to Cart
                </button>
                <Link
                  to="/shop"
                  className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;