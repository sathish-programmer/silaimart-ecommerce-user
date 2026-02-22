import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const [imgError, setImgError] = useState(false);

  const inWishlist = isInWishlist ? isInWishlist(product._id) : false;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist && removeFromWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else if (addToWishlist) {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 group-hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-gray-50">
            {product.images?.[0]?.url && !imgError ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary-50 to-indigo-50">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-500 font-medium text-sm leading-tight">{product.name}</span>
              </div>
            )}

            {/* Badges */}
            {discountPercentage > 0 && (
              <div className="absolute top-2.5 left-2.5 bg-secondary-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                -{discountPercentage}%
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-gray-800 text-white text-sm font-semibold px-4 py-1.5 rounded-full">Out of Stock</span>
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2.5 right-2.5 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              {inWishlist
                ? <HeartIcon className="h-4 w-4 text-secondary-500" />
                : <HeartOutlineIcon className="h-4 w-4 text-gray-400" />
              }
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            {product.category?.name && (
              <span className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1 block">
                {product.category.name}
              </span>
            )}

            <h3 className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating?.average > 0 && (
              <div className="flex items-center mb-2.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.floor(product.rating.average)
                          ? 'text-amber-400'
                          : 'text-gray-200'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-xs ml-1.5">({product.rating.count})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-primary-600 font-bold text-lg">
                  ₹{displayPrice?.toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ₹{product.price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;