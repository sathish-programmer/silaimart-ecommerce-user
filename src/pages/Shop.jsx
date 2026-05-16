import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  HeartIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import FilterDrawer from '../components/FilterDrawer';
import { trackEvent } from '../utils/analytics';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ── Admin-managed offer banner strip ───────────────────────── */
const OfferBanners = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/banners?position=shop-top&active=true`)
      .then(r => setBanners((r.data.banners || []).filter(b => b.title?.trim())))
      .catch(() => {});
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {banners.map(b => (
        <Link
          key={b._id}
          to={b.link?.url || '/shop'}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: b.backgroundColor || '#7c3aed' }}
        >
          <span>{b.title}</span>
          {b.subtitle && <span className="opacity-75 hidden sm:inline">· {b.subtitle}</span>}
        </Link>
      ))}
    </div>
  );
};


/* ── Product Card — same compact style as home ──────────────── */
const ProductCard = ({ product, viewMode }) => {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const inWish = isInWishlist(product._id);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart!');
  };

  const handleWish = (e) => {
    e.preventDefault();
    inWish ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    addItem(product);
    navigate('/checkout');
  };

  if (viewMode === 'list') {
    return (
      <Link
        to={`/product/${product._id}`}
        className="group flex bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden"
      >
        <div className="relative w-36 sm:w-48 flex-shrink-0 bg-gray-50">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center min-h-[140px]">
              <PhotoIcon className="h-8 w-8 text-gray-200" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">-{discount}%</span>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{product.category?.name}</span>
            <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
            {product.rating?.count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                  {product.rating.average?.toFixed(1)} <StarIcon className="h-2.5 w-2.5 fill-current" />
                </span>
                <span className="text-[10px] text-gray-400">({product.rating.count})</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-gray-900">₹{(product.discountPrice || product.price).toLocaleString()}</span>
              {product.discountPrice && <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCart} className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors">Add to Cart</button>
              <button onClick={handleBuyNow} className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">Buy Now</button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-gray-50 overflow-hidden" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PhotoIcon className="h-12 w-12 text-gray-200" />
            </div>
          )}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {product.isFeatured && !discount && (
          <span className="absolute top-2 left-2 z-10 bg-amber-400 text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <SparklesIcon className="h-2.5 w-2.5" /> Featured
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {inWish
            ? <HeartSolid className="h-4 w-4 text-rose-500" />
            : <HeartIcon className="h-4 w-4 text-gray-400" />
          }
        </button>

        {/* Add to Cart */}
        <button
          onClick={handleCart}
          className="absolute bottom-0 left-0 right-0 z-10 bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-1"
        >
          <ShoppingCartIcon className="h-3.5 w-3.5" />
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">{product.category?.name}</span>
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mt-1 flex-1">{product.name}</p>

        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              {product.rating.average?.toFixed(1)} <StarIcon className="h-2.5 w-2.5 fill-current" />
            </span>
            <span className="text-[10px] text-gray-400">({product.rating.count})</span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-sm font-black text-gray-900">₹{(product.discountPrice || product.price).toLocaleString()}</span>
          {product.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added!'); navigate('/checkout'); }}
          className="mt-2 w-full bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
        >
          Buy Now
        </button>
      </div>
    </Link>
  );
};

/* ── Skeleton loader ─────────────────────────────────────────── */
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="bg-gray-100 aspect-square" />
        <div className="p-3 space-y-2">
          <div className="h-2 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Main Shop Component ─────────────────────────────────────── */
const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [masterValues, setMasterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [filterOptions, setFilterOptions] = useState({});

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'createdAt',
    material: searchParams.get('material') || '',
  });

  // Fetch categories & master values once
  useEffect(() => {
    axios.get(`${API_URL}/categories`).then(r => setCategories(r.data.categories || [])).catch(() => {});
    axios.get(`${API_URL}/master-values`).then(r => setMasterValues(r.data.masterValues || {})).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build clean params — skip empty strings so they don't confuse the backend
      const params = { page: pagination.currentPage, limit: 20 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const { data } = await axios.get(`${API_URL}/products`, { params });
      setProducts(data.products || []);
      setFilterOptions(data.filterOptions || {});
      setPagination(p => ({
        ...p,
        totalPages: Number(data.totalPages) || 1,
        total: Number(data.total) || 0,
      }));
    } catch (err) {
      console.error('Shop fetch error:', err);
      toast.error('Could not load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPagination(p => ({ ...p, currentPage: 1 }));
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const def = { search: '', category: '', subCategory: '', minPrice: '', maxPrice: '', rating: '', sort: 'createdAt', material: '' };
    setFilters(def);
    setSearchParams({});
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'sort' && v).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        categories={categories}
        filterOptions={filterOptions}
        masterValues={masterValues}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        activeFiltersCount={activeCount}
      />

      {/* ── Admin-managed offer banners ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <OfferBanners />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

        {/* ── Top bar: title + search + filter + view ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              All Products
              {pagination.total > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-400 normal-case">({pagination.total} items)</span>
              )}
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="h-9 w-44 sm:w-56 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={e => handleFilterChange('sort', e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none focus:border-primary-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Best Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`h-9 flex items-center gap-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
              activeCount > 0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>

          {/* View mode */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-700'}`}>
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-700'}`}>
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline">
              <XMarkIcon className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <SkeletonGrid />
        ) : products.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
                : 'flex flex-col gap-3'
            }>
              {products.map(p => (
                <ProductCard key={p._id} product={p} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        pagination.currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">No products found</h3>
            <p className="text-sm text-gray-400 mb-6">Try changing your filters or search term</p>
            <button
              onClick={clearFilters}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;