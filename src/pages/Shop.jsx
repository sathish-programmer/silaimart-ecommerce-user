import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
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

  useEffect(() => {
    fetchCategories();
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

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success('Added to cart!');
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
              <div className="h-10 bg-gray-800 rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-800 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-gray-800 rounded-xl w-80 animate-pulse"></div>
              <div className="h-12 bg-gray-800 rounded-xl w-24 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex gap-8">
            {/* Filters Skeleton */}
            <div className="w-80 hidden lg:block">
              <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="h-5 bg-gray-800 rounded w-24 mb-3 animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
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
                  <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700">
                    <div className="aspect-square bg-gray-800 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
                      <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                      <div className="h-12 bg-gray-800 rounded-xl animate-pulse"></div>
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
            <h1 className="text-4xl font-bold text-white mb-2">Divine Sculptures</h1>
            <p className="text-gray-400">Discover our handcrafted collection of {pagination.total} sculptures</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sculptures, deities, materials..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showFilters 
                    ? 'bg-bronze text-black' 
                    : 'bg-gray-900 border border-gray-700 text-white hover:border-bronze'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-bronze text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-bronze text-black' : 'text-gray-400 hover:text-white'
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
          {/* Enhanced Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sticky top-24 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-bronze" />
                  Filters
                </h3>
                <div className="flex items-center space-x-2">
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-bronze text-black text-xs px-2 py-1 rounded-full font-medium">
                      {getActiveFiltersCount()} active
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-bronze text-sm hover:text-gold transition-colors font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                  Categories
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="text-bronze focus:ring-bronze"
                    />
                    <span className="ml-3 text-gray-300 font-medium">All Categories</span>
                  </label>
                  {Array.isArray(categories) && categories.map((category) => (
                    <label key={category._id} className="flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-bronze focus:ring-bronze"
                      />
                      <span className="ml-3 text-gray-300">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Min Price</label>
                      <input
                        type="number"
                        placeholder="₹0"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Max Price</label>
                      <input
                        type="number"
                        placeholder="₹∞"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>₹500</span>
                    <span>₹50,000+</span>
                  </div>
                </div>
              </div>

              {/* Sculpture Specific Filters */}
              {filterOptions.stones && filterOptions.stones.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                    Stone Type
                  </h4>
                  <select
                    value={filters.stone}
                    onChange={(e) => handleFilterChange('stone', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                  >
                    <option value="">All Stones</option>
                    {filterOptions.stones.filter(stone => stone).map((stone) => (
                      <option key={stone} value={stone}>{stone}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {filterOptions.finishes && filterOptions.finishes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                    Finish
                  </h4>
                  <select
                    value={filters.finish}
                    onChange={(e) => handleFilterChange('finish', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                  >
                    <option value="">All Finishes</option>
                    {filterOptions.finishes.filter(finish => finish).map((finish) => (
                      <option key={finish} value={finish}>{finish}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {filterOptions.deities && filterOptions.deities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                    Deity
                  </h4>
                  <select
                    value={filters.deity}
                    onChange={(e) => handleFilterChange('deity', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                  >
                    <option value="">All Deities</option>
                    {filterOptions.deities.filter(deity => deity).map((deity) => (
                      <option key={deity} value={deity}>{deity}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                  Rating
                </h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating.toString()}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="text-bronze focus:ring-bronze"
                      />
                      <div className="ml-3 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-gray-300 text-sm">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                  Sort By
                </h4>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                >
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

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info & Active Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  Showing <span className="text-white font-medium">{products.length}</span> of <span className="text-bronze font-medium">{pagination.total}</span> sculptures
                </p>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none lg:hidden"
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
                      <span
                        key={key}
                        className="inline-flex items-center px-3 py-1 bg-bronze/20 text-bronze text-sm rounded-full border border-bronze/30"
                      >
                        {key}: {displayValue}
                        <button
                          onClick={() => handleFilterChange(key, '')}
                          className="ml-2 hover:text-gold transition-colors"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-white transition-colors underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {products.length > 0 ? (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-6'
                }`}>
                  {products.map((product) => (
                    viewMode === 'grid' ? (
                      // Grid View
                      <div key={product._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-700 hover:border-bronze/50">
                        <Link to={`/product/${product._id}`}>
                          <div className="relative aspect-square overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <>
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center" style={{display: 'none'}}>
                                  <div className="text-center">
                                    <div className="w-16 h-16 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <svg className="w-8 h-8 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                      </svg>
                                    </div>
                                    <div className="text-white font-semibold text-sm">{product.name}</div>
                                    <div className="text-gray-400 text-xs mt-1">{product.category?.name}</div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                  </div>
                                  <div className="text-white font-semibold text-sm">{product.name}</div>
                                  <div className="text-gray-400 text-xs mt-1">{product.category?.name}</div>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col space-y-2">
                              {product.discountPrice && (
                                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                </div>
                              )}
                              {product.isFeatured && (
                                <div className="bg-gradient-to-r from-bronze to-gold text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  ⭐ Featured
                                </div>
                              )}
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                                <HeartIcon className="h-5 w-5" />
                              </button>
                            </div>
                            
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                  Out of Stock
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                        
                        <div className="p-6">
                          <Link to={`/product/${product._id}`}>
                            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-bronze transition-colors line-clamp-2 leading-tight">
                              {product.name}
                            </h3>
                          </Link>
                          
                          {/* Category & Details */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-bronze text-sm font-medium">
                              {product.category?.name}
                            </span>
                            {product.sculptureDetails?.stone && (
                              <span className="text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded-full">
                                {product.sculptureDetails.stone}
                              </span>
                            )}
                          </div>
                          
                          {/* Rating */}
                          {product.rating?.average > 0 && (
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating.average) 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-600'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-400 text-sm ml-2">
                                ({product.rating.count})
                              </span>
                            </div>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-bronze font-bold text-xl">
                                ₹{(product.discountPrice || product.price).toLocaleString()}
                              </span>
                              {product.discountPrice && (
                                <span className="text-gray-500 line-through text-sm">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.stock <= 5 && product.stock > 0 && (
                              <span className="text-orange-400 text-xs font-medium">
                                Only {product.stock} left
                              </span>
                            )}
                          </div>
                          
                          {/* Action Button */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="w-full bg-gradient-to-r from-bronze to-gold text-black py-3 rounded-xl font-bold hover:from-gold hover:to-bronze transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div key={product._id} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-700 hover:border-bronze/50">
                        <div className="flex flex-col md:flex-row">
                          <Link to={`/product/${product._id}`} className="md:w-80 flex-shrink-0">
                            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
                              {product.images?.[0]?.url ? (
                                <>
                                  <img 
                                    src={product.images[0].url} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center" style={{display: 'none'}}>
                                    <div className="text-center">
                                      <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                      </div>
                                      <div className="text-white font-semibold">{product.name}</div>
                                      <div className="text-gray-400 text-sm mt-1">{product.category?.name}</div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <svg className="w-10 h-10 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                      </svg>
                                    </div>
                                    <div className="text-white font-semibold">{product.name}</div>
                                    <div className="text-gray-400 text-sm mt-1">{product.category?.name}</div>
                                  </div>
                                </div>
                              )}
                              {product.discountPrice && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                </div>
                              )}
                            </div>
                          </Link>
                          
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <Link to={`/product/${product._id}`}>
                                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-bronze transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <span className="text-bronze font-medium">
                                  {product.category?.name}
                                </span>
                                {product.sculptureDetails?.stone && (
                                  <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded-full">
                                    {product.sculptureDetails.stone}
                                  </span>
                                )}
                                {product.sculptureDetails?.finish && (
                                  <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded-full">
                                    {product.sculptureDetails.finish}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                {stripHtmlTags(product.description)}
                              </p>
                              
                              {product.rating?.average > 0 && (
                                <div className="flex items-center mb-4">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon 
                                        key={i} 
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating.average) 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-600'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-gray-400 text-sm ml-2">
                                    ({product.rating.count} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-bronze font-bold text-2xl">
                                  ₹{(product.discountPrice || product.price).toLocaleString()}
                                </span>
                                {product.discountPrice && (
                                  <span className="text-gray-500 line-through text-lg">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="bg-gradient-to-r from-bronze to-gold text-black px-6 py-3 rounded-xl font-bold hover:from-gold hover:to-bronze transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                <ShoppingCartIcon className="h-5 w-5" />
                                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                              </button>
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
                        className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                            className={`px-4 py-2 rounded-xl transition-all ${
                              pagination.currentPage === pageNum
                                ? 'bg-gradient-to-r from-bronze to-gold text-black font-bold'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No sculptures found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
                  <div className="space-y-3">
                    <button
                      onClick={clearFilters}
                      className="w-full bg-bronze text-black py-3 rounded-xl font-semibold hover:bg-gold transition-colors"
                    >
                      Clear all filters
                    </button>
                    <Link
                      to="/shop"
                      className="block w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
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