import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, SparklesIcon, XMarkIcon, AdjustmentsHorizontalIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import ShopBanner from '../components/ShopBanner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to strip HTML tags from text
const stripHtmlTags = (html) => {
  if (!html) return '';
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .trim();
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [masterValues, setMasterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const { addItem } = useCartStore();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'createdAt',
    stone: searchParams.get('stone') || '',
    finish: searchParams.get('finish') || '',
    material: searchParams.get('material') || '',
    deity: searchParams.get('deity') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || ''
  });

  const [filterOptions, setFilterOptions] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [quantities, setQuantities] = useState({}); // Track quantity for each product
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchMasterValues();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchMasterValues = async () => {
    try {
      const response = await axios.get(`${API_URL}/master-values`);
      setMasterValues(response.data.masterValues || {});
    } catch (error) {
      console.error('Error fetching master values:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...filters
      });
      const response = await axios.get(`${API_URL}/products?${params}`);
      setProducts(response.data.products || []);
      setFilterOptions(response.data.filterOptions || {});
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handleAddToCart = (product, quantity = 1) => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = (product, quantity = 1) => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const updateQuantity = (productId, change) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(change === 'inc' ? currentQty + 1 : currentQty - 1, 999));
      return { ...prev, [productId]: newQty };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'createdAt',
      stone: '',
      finish: '',
      material: '',
      deity: '',
      size: '',
      color: ''
    });
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) =>
      key !== 'sort' && value && value !== ''
    ).length;
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <ShopBanner />

          {/* Loading Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
            <div>
              <div className="h-10 bg-gray-50 rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-50 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-gray-50 rounded-xl w-80 animate-pulse"></div>
              <div className="h-12 bg-gray-50 rounded-xl w-24 animate-pulse"></div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Skeleton */}
            <div className="w-80 hidden lg:block">
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-5 bg-gray-50 rounded w-24 mb-3 animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-50 rounded w-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                    <div className="aspect-square bg-gray-50 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-50 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-50 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-50 rounded w-full animate-pulse"></div>
                      <div className="h-8 bg-gray-50 rounded w-1/3 animate-pulse"></div>
                      <div className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Shop Banner */}
        <ShopBanner />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Divine Sculptures</h1>
            <p className="text-gray-500">Discover our handcrafted collection of {pagination.total} sculptures</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sculptures, deities, materials..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${showFilters
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-violet-400'
                  }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Modern Filters Sidebar */}
          <div className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl sticky top-24 border border-gray-100 shadow-sm overflow-hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-violet-500" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </h3>
                <button onClick={clearFilters}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Clear All
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer group">
                      <input type="radio" name="category" value=""
                        checked={filters.category === ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="accent-violet-600" />
                      <span className={`text-sm font-medium ${filters.category === '' ? 'text-violet-700' : 'text-gray-600 group-hover:text-gray-900'}`}>All Categories</span>
                    </label>
                    {Array.isArray(categories) && categories.map((category) => (
                      <label key={category._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer group">
                        <input type="radio" name="category" value={category._id}
                          checked={filters.category === category._id}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="accent-violet-600" />
                        <span className={`text-sm ${filters.category === category._id ? 'text-violet-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Min</label>
                      <input type="number" placeholder="₹0" value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Max</label>
                      <input type="number" placeholder="₹∞" value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-1">
                    <span>₹500</span><span>₹50,000+</span>
                  </div>
                </div>

                {/* Stone Type */}
                {masterValues.stone_types && masterValues.stone_types.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stone Type</h4>
                    <select value={filters.stone} onChange={(e) => handleFilterChange('stone', e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none">
                      <option value="">All Stones</option>
                      {masterValues.stone_types.map((stone) => <option key={stone._id} value={stone.value}>{stone.label}</option>)}
                    </select>
                  </div>
                )}

                {/* Finish */}
                {masterValues.finishes && masterValues.finishes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Finish</h4>
                    <select value={filters.finish} onChange={(e) => handleFilterChange('finish', e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none">
                      <option value="">All Finishes</option>
                      {masterValues.finishes.map((f) => <option key={f._id} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                )}

                {/* Deity */}
                {filterOptions.deities && filterOptions.deities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Deity</h4>
                    <select value={filters.deity} onChange={(e) => handleFilterChange('deity', e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none">
                      <option value="">All Deities</option>
                      {filterOptions.deities.filter(d => d).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Minimum Rating</h4>
                  <div className="space-y-1">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer group">
                        <input type="radio" name="rating" value={rating}
                          checked={filters.rating === rating.toString()}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                          className="accent-amber-500" />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                          <span className={`text-xs ml-1 ${filters.rating === rating.toString() ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>&amp; up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sort By</h4>
                  <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none">
                    <option value="createdAt">✨ Newest First</option>
                    <option value="price">💰 Price: Low to High</option>
                    <option value="-price">💎 Price: High to Low</option>
                    <option value="-rating">⭐ Highest Rated</option>
                    <option value="popularity">🔥 Most Popular</option>
                    <option value="name">📝 Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info & Active Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  Showing <span className="text-gray-900 font-medium">{products.length}</span> of <span className="text-primary-600 font-medium">{pagination.total}</span> sculptures
                </p>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-primary-600 focus:outline-none lg:hidden"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              {/* Active Filters Tags */}
              {getActiveFiltersCount() > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (key === 'sort' || !value) return null;
                    const displayValue = key === 'category'
                      ? categories.find(cat => cat._id === value)?.name || value
                      : value;
                    return (
                      <span key={key}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs rounded-full border border-violet-200 font-medium">
                        {key}: {displayValue}
                        <button onClick={() => handleFilterChange(key, '')}
                          className="ml-0.5 hover:text-rose-500 transition-colors">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {products.length > 0 ? (
              <>
                <div className={`${viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
                  }`}>
                  {products.map((product) => (
                    viewMode === 'grid' ? (
                      // Grid View
                      <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-gray-100 hover:border-primary-600/30 hover:-translate-y-1">
                        <Link to={`/product/${product._id}`}>
                          <div className="relative aspect-square overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <>
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.stock === 0 ? 'grayscale' : ''}`}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                  {/* Pattern overlay */}
                                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                    <svg width="100%" height="100%"><pattern id={`grid-pattern-${product._id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill={`url(#grid-pattern-${product._id})`} /></svg>
                                  </div>
                                  <div className="text-center relative z-10">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 rotate-3 transition-transform duration-500 group-hover:rotate-0">
                                      <SparklesIcon className="w-10 h-10 text-stone-300" />
                                    </div>
                                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Sanctuary Art</div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                  <svg width="100%" height="100%"><pattern id={`grid-pattern-none-${product._id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill={`url(#grid-pattern-none-${product._id})`} /></svg>
                                </div>
                                <div className="text-center relative z-10">
                                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                                    <SparklesIcon className="w-10 h-10 text-stone-300" />
                                  </div>
                                  <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Sanctuary Art</div>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Modern Status Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                              {product.discountPrice && (
                                <div className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 backdrop-blur-sm">
                                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                                </div>
                              )}
                              {product.isFeatured && (
                                <div className="bg-amber-400 text-gray-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 backdrop-blur-sm flex items-center gap-1.5">
                                  <SparklesIcon className="h-3 w-3" />
                                  <span>Featured</span>
                                </div>
                              )}
                            </div>

                            {/* Modern Out of Stock UI */}
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-30 flex items-center justify-center p-6">
                                <div className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center transform -rotate-12 shadow-2xl">
                                  <span className="text-white font-black text-xl uppercase tracking-[0.2em]">Sold Out</span>
                                  <span className="text-white/60 text-[8px] font-black uppercase tracking-[0.4em] mt-1">SilaMart Sanctuary</span>
                                </div>
                              </div>
                            )}

                            {/* Quick Actions (moved to avoid overlap) */}
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <button className="p-3 bg-white text-rose-500 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                                <HeartIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </Link>

                        <div className="p-5">
                          <Link to={`/product/${product._id}`}>
                            <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight hover:underline decoration-bronze/50">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Category & Details */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-primary-600 text-sm font-medium">
                              {product.category?.name}
                            </span>
                            {product.sculptureDetails?.stone && (
                              <span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded-full">
                                {product.sculptureDetails.stone}
                              </span>
                            )}
                          </div>

                          {/* Rating */}
                          {product.rating?.average > 0 && (
                            <div className="flex items-center gap-1.5 mb-3 bg-gray-50/50 w-fit px-2 py-1 rounded-lg">
                              <StarIcon className="h-4 w-4 text-amber-400 fill-amber-400" />
                              <span className="text-gray-900 font-bold text-sm">
                                {product.rating.average.toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-xs font-medium">
                                ({product.rating.count})
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-primary-600 font-bold text-2xl">
                                ₹{(product.discountPrice || product.price).toLocaleString()}
                              </span>
                              {product.discountPrice && (
                                <span className="text-gray-500 line-through text-sm font-medium">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.stock <= 5 && product.stock > 0 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                Only {product.stock} left
                              </span>
                            )}
                          </div>

                          {/* Quantity Selector & Actions */}
                          <div className="space-y-3 mt-4 pt-4 border-t border-gray-200/50">
                            <div className="flex items-center justify-between">
                              <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">Quantity</label>
                              <div className="flex items-center bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-inner">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product._id, 'dec');
                                  }}
                                  disabled={product.stock === 0 || (quantities[product._id] || 1) <= 1}
                                  className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-gray-900 font-bold text-base min-w-[3.5rem] text-center bg-white/50 border-x border-gray-200/50">
                                  {quantities[product._id] || 1}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product._id, 'inc');
                                  }}
                                  disabled={product.stock === 0 || (quantities[product._id] || 1) >= Math.min(product.stock, 99)}
                                  className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product, quantities[product._id] || 1);
                                }}
                                disabled={product.stock === 0}
                                className="group relative bg-gradient-to-r from-violet-600 to-purple-700 text-white py-3 rounded-xl font-bold hover:from-violet-700 hover:to-purple-800 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <ShoppingCartIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyNow(product, quantities[product._id] || 1);
                                }}
                                disabled={product.stock === 0}
                                className="group border border-violet-200 text-violet-700 py-3 rounded-xl font-bold hover:bg-violet-50 transition-all duration-300 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-sm hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <span className="font-semibold">Buy Now</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-gray-100 hover:border-primary-600/30 hover:-translate-y-0.5">
                        <div className="flex flex-col md:flex-row">
                          <Link to={`/product/${product._id}`} className="md:w-80 flex-shrink-0">
                            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
                              {product.images?.[0]?.url ? (
                                <>
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'grayscale' : ''}`}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white flex items-center justify-center relative overflow-hidden" style={{ display: 'none' }}>
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                      <svg width="100%" height="100%"><pattern id={`list-pattern-${product._id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill={`url(#list-pattern-${product._id})`} /></svg>
                                    </div>
                                    <div className="text-center relative z-10 p-4">
                                      <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white rotate-3 group-hover:rotate-0 transition-transform duration-700">
                                        <SparklesIcon className="w-8 h-8 text-stone-300" />
                                      </div>
                                      <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Divine Art</div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white flex items-center justify-center relative overflow-hidden">
                                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                    <svg width="100%" height="100%"><pattern id={`list-pattern-none-${product._id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill={`url(#list-pattern-none-${product._id})`} /></svg>
                                  </div>
                                  <div className="text-center relative z-10 p-4">
                                    <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white rotate-6 group-hover:rotate-0 transition-transform duration-700">
                                      <SparklesIcon className="w-8 h-8 text-stone-300" />
                                    </div>
                                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Divine Art</div>
                                  </div>
                                </div>
                              )}
                              {product.stock === 0 && (
                                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-30 flex items-center justify-center p-6">
                                  <div className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center transform -rotate-12 shadow-2xl">
                                    <span className="text-white font-black text-lg uppercase tracking-[0.2em]">Sold Out</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <Link to={`/product/${product._id}`}>
                                <h3 className="text-gray-900 font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                                  {product.name}
                                </h3>
                              </Link>

                              <div className="flex items-center space-x-4 mb-3">
                                <span className="text-primary-600 font-medium">
                                  {product.category?.name}
                                </span>
                                {product.sculptureDetails?.stone && (
                                  <span className="text-gray-400 text-sm bg-gray-50 px-2 py-1 rounded-full">
                                    {product.sculptureDetails.stone}
                                  </span>
                                )}
                                {product.sculptureDetails?.finish && (
                                  <span className="text-gray-400 text-sm bg-gray-50 px-2 py-1 rounded-full">
                                    {product.sculptureDetails.finish}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                {stripHtmlTags(product.description)}
                              </p>

                              {product.rating?.average > 0 && (
                                <div className="flex items-center gap-1.5 mb-4 bg-gray-50/50 w-fit px-2 py-1 rounded-lg">
                                  <StarIcon className="h-4 w-4 text-amber-400 fill-amber-400" />
                                  <span className="text-gray-900 font-bold text-sm">
                                    {product.rating.average.toFixed(1)}
                                  </span>
                                  <span className="text-gray-400 text-xs font-medium font-medium">
                                    ({product.rating.count} reviews)
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-primary-600 font-bold text-2xl">
                                    ₹{(product.discountPrice || product.price).toLocaleString()}
                                  </span>
                                  {product.discountPrice && (
                                    <span className="text-gray-500 line-through text-lg">
                                      ₹{product.price.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Selector & Actions */}
                              <div className="space-y-3 pt-3 border-t border-gray-200/50">
                                <div className="flex items-center justify-between">
                                  <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">Quantity</label>
                                  <div className="flex items-center bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-inner">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(product._id, 'dec');
                                      }}
                                      disabled={product.stock === 0 || (quantities[product._id] || 1) <= 1}
                                      className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 text-gray-900 font-bold text-base min-w-[3.5rem] text-center bg-white/50 border-x border-gray-200/50">
                                      {quantities[product._id] || 1}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(product._id, 'inc');
                                      }}
                                      disabled={product.stock === 0 || (quantities[product._id] || 1) >= Math.min(product.stock, 99)}
                                      className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product, quantities[product._id] || 1);
                                    }}
                                    disabled={product.stock === 0}
                                    className="group flex-1 bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-3 rounded-xl font-bold hover:from-violet-700 hover:to-purple-800 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:scale-[1.02] active:scale-[0.98]"
                                  >
                                    <ShoppingCartIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBuyNow(product, quantities[product._id] || 1);
                                    }}
                                    disabled={product.stock === 0}
                                    className="group flex-1 border border-violet-200 text-violet-700 px-4 py-3 rounded-xl font-bold hover:bg-violet-50 transition-all duration-300 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                  >
                                    <span className="font-semibold">Buy Now</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>

                      {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + index;
                        } else {
                          pageNum = pagination.currentPage - 2 + index;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                            className={`px-4 py-2 rounded-xl transition-all ${pagination.currentPage === pageNum
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 font-bold'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No sculptures found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
                  <div className="space-y-3">
                    <button
                      onClick={clearFilters}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Clear all filters
                    </button>
                    <Link
                      to="/shop"
                      className="block w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Browse all sculptures
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

// Add custom scrollbar styles
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #CD7F32;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #D4AF37;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customScrollbarStyles;
  document.head.appendChild(styleSheet);
}