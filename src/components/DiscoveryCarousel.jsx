import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon as StarSolid,
  ShoppingCartIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ── Individual Product Card (compact ecom style) ──────────── */
const PCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart!');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex-shrink-0 w-[168px] sm:w-[190px] bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-[168px] sm:h-[190px] bg-gray-50 overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="h-10 w-10 text-gray-200" />
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}

        {/* Wishlist btn */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <HeartIcon className={`h-4 w-4 ${inWishlist ? 'text-rose-500' : 'text-gray-300'}`} />
        </button>

        {/* Quick add to cart */}
        <button
          onClick={handleCart}
          className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-1"
        >
          <ShoppingCartIcon className="h-3.5 w-3.5" />
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Name */}
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
          {product.name}
        </p>

        {/* Rating */}
        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              {product.rating.average?.toFixed(1)}
              <StarSolid className="h-2.5 w-2.5" />
            </span>
            <span className="text-[10px] text-gray-400">({product.rating.count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-gray-900">
            ₹{(product.discountPrice || product.price).toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Badges */}
        {(product.isFeatured || product.isBestSeller) && (
          <p className="text-[9px] text-primary-600 font-black uppercase tracking-wider mt-1">
            {product.isBestSeller ? '⭐ Best Seller' : product.isFeatured ? '✦ Featured' : ''}
          </p>
        )}
      </div>
    </Link>
  );
};

/* ── DiscoveryCarousel ─────────────────────────────────────── */
const DiscoveryCarousel = ({ title, subtitle, products: initialProducts, loading: initialLoading, type }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(initialLoading || false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    if (!initialProducts && type) {
      setLoading(true);
      axios
        .get(`${API_URL}/products/recommendations?type=${type}`, { signal: controller.signal })
        .then((r) => setProducts(r.data.products || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    return () => controller.abort();
  }, [type]);

  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="bg-white py-5 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-[168px] h-[280px] bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            </button>
            <Link
              to="/shop"
              className="text-primary-600 text-xs font-black uppercase tracking-widest hover:underline ml-2"
            >
              See All
            </Link>
          </div>
        </div>

        {/* Product scroll */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((p) => (
            <PCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoveryCarousel;
