import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, ShoppingCartIcon, HeartIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const discountPercentage = (product.discountPrice && product.discountPrice < product.price)
    ? Math.abs(Math.round(((product.price - product.discountPrice) / product.price) * 100))
    : 0;

  const displayPrice = product.discountPrice || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-[2rem] border border-stone-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 overflow-hidden"
    >
      <Link to={`/product/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
          {product.images?.[0]?.url && !imgError ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <PhotoIcon className="w-12 h-12 text-stone-200 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Crafting...</span>
            </div>
          )}

          {/* Flipkart Style Assured Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-stone-100">
              <CheckBadgeIcon className="h-4 w-4 text-primary-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Verified</span>
            </div>
            {discountPercentage > 0 && (
              <div className="bg-secondary-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary-500/20 w-fit">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Wishlist Overlay */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
          >
            {inWishlist ? (
              <HeartIcon className="h-5 w-5 text-rose-500" />
            ) : (
              <HeartOutlineIcon className="h-5 w-5 text-stone-400 hover:text-rose-500 transition-colors" />
            )}
          </button>

          {/* Quick Buy Overlay */}
          <div className={`absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/20 to-transparent transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-stone-900 hover:bg-black text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
              {product.category?.name || 'Artisan'}
            </span>
            {product.rating?.average > 0 && (
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100">
                <StarIcon className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] font-black text-stone-600">{product.rating.average}</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-stone-900 line-clamp-2 mb-4 h-10 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.discountPrice && (
                <span className="text-[10px] text-stone-400 line-through font-bold mb-0.5">
                  ₹{product.price?.toLocaleString()}
                </span>
              )}
              <span className="text-xl font-black text-stone-900 tracking-tighter">
                ₹{displayPrice?.toLocaleString()}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full border-2 border-stone-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-600 transition-all">
              <SparklesIcon className="h-4 w-4 text-stone-300 group-hover:text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
