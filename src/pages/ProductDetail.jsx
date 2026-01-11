import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, HeartIcon, ShareIcon, TruckIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import SocialShare from '../components/SocialShare';
import CustomerReviews from '../components/CustomerReviews';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data.product);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}/related`);
      setRelatedProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    const selectedProduct = {
      ...product,
      selectedSize,
      selectedColor
    };
    addItem(selectedProduct, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };
  
  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bronze"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-bronze transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-bronze transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category?._id}`} className="hover:text-bronze transition-colors">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-bronze transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Enhanced Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-900 group">
              <div 
                className="relative w-full h-full cursor-zoom-in"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Zoom Overlay */}
                {showZoom && (
                  <div 
                    className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${product.images?.[selectedImage]?.url})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                  />
                )}
              </div>
              
              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
              
              {/* Discount Badge */}
              {product.discountPrice && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  -{discountPercentage}% OFF
                </div>
              )}
              
              {/* Stock Status */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Only {product.stock} left!
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-bronze shadow-lg scale-105' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-bronze font-semibold text-lg">{product.category?.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (isInWishlist(product._id)) {
                        removeFromWishlist(product._id);
                      } else {
                        addToWishlist(product);
                      }
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist(product._id) ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <HeartIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-800 text-gray-400 hover:text-bronze rounded-full transition-colors"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
              
              {/* SKU */}
              {product.sku && (
                <p className="text-gray-400 text-sm mb-4">SKU: {product.sku}</p>
              )}
            </div>

            {/* Rating & Reviews */}
            {product.rating?.average > 0 && (
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-700">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(product.rating.average)
                          ? 'text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-lg">
                  {product.rating.average.toFixed(1)}
                </span>
                <span className="text-gray-400">
                  ({product.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Price & Discount */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-4xl font-bold text-bronze">
                  ₹{(product.discountPrice || product.price).toLocaleString()}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save ₹{(product.price - product.discountPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm">Inclusive of all taxes</p>
            </div>

            {/* Sculpture Details */}
            {product.sculptureDetails && (
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-bronze rounded-full mr-2"></span>
                  Sculpture Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.sculptureDetails.stone && (
                    <div>
                      <span className="text-gray-400">Stone:</span>
                      <span className="text-white ml-2 font-medium">{product.sculptureDetails.stone}</span>
                    </div>
                  )}
                  {product.sculptureDetails.finish && (
                    <div>
                      <span className="text-gray-400">Finish:</span>
                      <span className="text-white ml-2 font-medium">{product.sculptureDetails.finish}</span>
                    </div>
                  )}
                  {product.sculptureDetails.deity && (
                    <div>
                      <span className="text-gray-400">Deity:</span>
                      <span className="text-white ml-2 font-medium">{product.sculptureDetails.deity}</span>
                    </div>
                  )}
                  {product.sculptureDetails.origin && (
                    <div>
                      <span className="text-gray-400">Origin:</span>
                      <span className="text-white ml-2 font-medium">{product.sculptureDetails.origin}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Dimensions:</span>
                      <span className="text-white ml-2 font-medium">
                        {product.dimensions.length}" × {product.dimensions.width}" × {product.dimensions.height}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Available Sizes</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={size.stock === 0}
                      className={`px-4 py-3 rounded-lg border transition-all relative ${
                        selectedSize === size.name
                          ? 'border-bronze bg-bronze text-black font-semibold'
                          : size.stock === 0
                          ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                          : 'border-gray-700 text-gray-300 hover:border-bronze'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{size.name}</div>
                        {size.price && (
                          <div className="text-xs mt-1">
                            ₹{size.price.toLocaleString()}
                          </div>
                        )}
                        {size.stock !== undefined && (
                          <div className="text-xs mt-1 opacity-75">
                            {size.stock === 0 ? 'Out of Stock' : `${size.stock} left`}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedColor === color.name
                          ? 'border-bronze bg-bronze text-black font-semibold'
                          : 'border-gray-700 text-gray-300 hover:border-bronze'
                      }`}
                    >
                      {color.code && (
                        <span 
                          className="inline-block w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: color.code }}
                        ></span>
                      )}
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold mb-2 block">Quantity</label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-6 py-3 text-white font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-gray-400 text-sm">Stock Available</p>
                <p className={`font-semibold ${
                  product.stock > 10 ? 'text-green-400' : 
                  product.stock > 0 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {product.stock > 10 ? 'In Stock' : 
                   product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-bronze to-gold text-black py-4 rounded-xl font-bold text-lg hover:from-gold hover:to-bronze transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Buy Now
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center justify-center space-x-8 py-4 bg-gray-900 rounded-xl">
                <div className="flex items-center space-x-2 text-green-400">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Authentic</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <TruckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <StarIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Handcrafted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-700 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'shipping', label: 'Shipping & Returns' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'share', label: 'Share' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-bronze text-bronze'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="bg-gray-900 rounded-2xl p-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-white mb-4">About this sculpture</h3>
                <div 
                  className="text-gray-300 leading-relaxed text-lg mb-6 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                
                {product.sculptureDetails?.artisan && (
                  <div className="bg-gray-800 p-6 rounded-xl">
                    <h4 className="text-white font-semibold mb-2">Artisan Information</h4>
                    <p className="text-gray-300">{product.sculptureDetails.artisan}</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {product.dimensions && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Dimensions</span>
                        <span className="text-white font-medium">
                          {product.dimensions.length}" × {product.dimensions.width}" × {product.dimensions.height}"
                        </span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Weight</span>
                        <span className="text-white font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    {product.material && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Material</span>
                        <span className="text-white font-medium">{product.material}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {product.sculptureDetails?.origin && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Origin</span>
                        <span className="text-white font-medium">{product.sculptureDetails.origin}</span>
                      </div>
                    )}
                    {product.sculptureDetails?.stone && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Stone Type</span>
                        <span className="text-white font-medium">{product.sculptureDetails.stone}</span>
                      </div>
                    )}
                    {product.sculptureDetails?.finish && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Finish</span>
                        <span className="text-white font-medium">{product.sculptureDetails.finish}</span>
                      </div>
                    )}
                    {product.sculptureDetails?.technique && (
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400">Technique</span>
                        <span className="text-white font-medium">{product.sculptureDetails.technique}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Shipping & Returns</h3>
                <div className="space-y-6">
                  <div className="bg-gray-800 p-6 rounded-xl">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <TruckIcon className="h-5 w-5 mr-2 text-bronze" />
                      Shipping Information
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Free shipping on orders above ₹1,000</li>
                      <li>• Standard delivery: 5-7 business days</li>
                      <li>• Express delivery: 2-3 business days (additional charges apply)</li>
                      <li>• Special handling for fragile sculptures</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-xl">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-400" />
                      Return Policy
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 7-day return policy for damaged items</li>
                      <li>• Original packaging required for returns</li>
                      <li>• Return shipping costs covered by us</li>
                      <li>• Full refund or replacement available</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <CustomerReviews productId={product._id} />
            )}
            
            {activeTab === 'share' && (
              <SocialShare product={product} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct._id} to={`/product/${relatedProduct._id}`}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-700 hover:border-bronze/50">
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={relatedProduct.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {relatedProduct.discountPrice && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                          -{Math.round(((relatedProduct.price - relatedProduct.discountPrice) / relatedProduct.price) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 group-hover:text-bronze transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-bronze font-bold text-lg">
                          ₹{(relatedProduct.discountPrice || relatedProduct.price).toLocaleString()}
                        </span>
                        {relatedProduct.discountPrice && (
                          <span className="text-gray-500 line-through text-sm">
                            ₹{relatedProduct.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;