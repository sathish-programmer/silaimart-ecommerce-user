import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  SparklesIcon,
  DocumentTextIcon,
  ScaleIcon,
  StarIcon as StarOutline,
  CheckBadgeIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  XMarkIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { trackEvent } from '../utils/analytics';
import QuickBuyButton from '../components/QuickBuyButton';
import SocialShare from '../components/SocialShare';
import CustomerReviews from '../components/CustomerReviews';
import axios from 'axios';
import toast from 'react-hot-toast';
import { trackProductView } from '../components/RecentlyViewed';
import SEO from '../components/SEO.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [displayImage, setDisplayImage] = useState('');
  const [settings, setSettings] = useState(null);

  // Pincode delivery check state
  const [showPincodeChecker, setShowPincodeChecker] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);


  const mainActionRef = useRef(null);
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      trackEvent('product_view', {
        id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        category: product.category?.name
      });
    }
  }, [product?._id]);

  useEffect(() => {
    if (product) {
      // Find matching variant
      const variant = product.variants?.find(v => 
        (v.color === selectedColor || !v.color) && 
        (v.size === selectedSize || !v.size)
      );

      if (variant) {
        if (variant.price) setDisplayPrice(variant.price);
        if (variant.image) setDisplayImage(variant.image);
        
        trackEvent('variant_selected', {
          productId: product._id,
          variantSku: variant.sku,
          color: selectedColor,
          size: selectedSize,
          price: variant.price
        });
      } else {
        setDisplayPrice(product.discountPrice || product.price);
        // Reset image only if we were on a variant image
        if (displayImage && product.variants?.some(v => v.image === displayImage)) {
           setDisplayImage(product.images?.[0]?.url || '');
        }
      }
    }
  }, [selectedColor, selectedSize, product]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainActionRef.current) {
        const rect = mainActionRef.current.getBoundingClientRect();
        setIsStickyVisible(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      const prod = response.data.product;
      setProduct(prod);
      setReviews(response.data.reviews || []);
      trackProductView(prod);
      setDisplayPrice(prod.discountPrice || prod.price);
      setDisplayImage(prod.images?.[0]?.url || '');
      
      // Default selections
      if (prod.sizes?.length > 0) {
        setSelectedSize(prod.sizes[0].name);
      }
      if (prod.colors?.length > 0) {
        setSelectedColor(prod.colors[0].name);
      }

      // Fetch public settings for dynamic offers
      try {
        const settingsRes = await axios.get(`${API_URL}/settings/public`);
        setSettings(settingsRes.data?.settings);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
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
    addItem(product, quantity, selectedSize, selectedColor);
    trackEvent('add_to_cart', {
      id: product._id,
      name: product.name,
      price: displayPrice,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    trackEvent('checkout_started', {
      id: product._id,
      name: product.name,
      price: displayPrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      method: 'buy_now'
    });
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      trackEvent('wishlist_removed', { id: product._id, name: product.name });
    } else {
      addToWishlist(product);
      trackEvent('wishlist_added', { id: product._id, name: product.name });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description?.replace(/<[^>]*>/g, ''),
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const generateStructuredData = () => {
    if (!product) return null;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images?.map(img => img.url),
      "description": product.description,
      "sku": product.sku || product._id,
      "brand": {
        "@type": "Brand",
        "name": "SilaiMart"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://silaimart.in/product/${product._id}`,
        "priceCurrency": "INR",
        "price": product.discountPrice || product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating?.average || 5,
        "reviewCount": product.rating?.count || 1
      }
    };

    return JSON.stringify(schema);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading SilaiMart Experience</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-stone-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="h-10 w-10 text-stone-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-8">The masterpiece you are looking for might have been moved or is currently unavailable.</p>
          <Link to="/shop" className="btn-primary inline-block w-full py-4 rounded-2xl">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Delivery estimation logic (Simple mock)
  const getDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 5));
    return deliveryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      toast.error('Enter a valid 6-digit pincode');
      return;
    }
    setPincodeLoading(true);
    setPincodeResult(null);
    try {
      const { data } = await axios.post(`${API_URL}/pincode/check`, { pincode: pincodeInput.trim() });
      setPincodeResult(data);
    } catch {
      toast.error('Could not check pincode. Please try again.');
    } finally {
      setPincodeLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <SEO 
        title={product?.name}
        description={product?.description?.substring(0, 160)}
        image={product?.images?.[0]?.url}
        type="product"
      />
      {/* SEO Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateStructuredData() }}
      />
      {/* Mobile Sticky Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-500 transform lg:hidden ${isStickyVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-2 shadow-2xl flex items-center gap-2">
          {(() => {
            const variant = product.variants?.find(v => 
              (v.color === selectedColor || !v.color) && 
              (v.size === selectedSize || !v.size)
            );
            const currentStock = variant ? variant.stock : product.stock;
            const isOutOfStock = currentStock === 0;

            return (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 ${isOutOfStock
                    ? 'bg-stone-100 text-stone-300'
                    : 'bg-stone-900 text-white'
                  }`}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  {isOutOfStock ? 'Sold Out' : 'Cart'}
                </button>
                <QuickBuyButton product={product} variant={variant} />
              </>
            );
          })()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-gray-900 line-clamp-1">{product.name}</span>
          </div>
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary-600 transition-all">
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Column 1: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-stone-200/50">
              <div
                className="aspect-[4/5] sm:aspect-square relative"
                onMouseEnter={() => !('ontouchstart' in window) && setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                {displayImage ? (
                  <>
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {showZoom && (
                      <div
                        className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block"
                        style={{
                          backgroundImage: `url(${displayImage})`,
                          backgroundSize: '200%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <SparklesIcon className="h-16 w-16 text-stone-200" />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                  {product.discountPrice && (
                    <div className="bg-rose-500 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg">
                      {discountPercentage}% OFF
                    </div>
                  )}
                  {product.isFeatured && (
                    <div className="bg-amber-400 text-gray-900 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                      <SparklesIcon className="h-3 w-3" /> Featured
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <button
                    onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
                    className={`p-3 sm:p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isInWishlist(product._id) ? 'bg-rose-500 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400'}`}
                  >
                    <HeartIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnails Swiper-like Area */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setDisplayImage(image.url);
                    }}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 ${selectedImage === index
                      ? 'border-primary-600 bg-primary-50 scale-105'
                      : 'border-transparent bg-white shadow-sm'
                    }`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {product.category?.name}
                </span>
                {product.rating?.count > 0 && (
                  <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                    <StarSolid className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-gray-900">{product.rating.average.toFixed(1)}</span>
                    <span className="text-[9px] text-gray-400">({product.rating.count})</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-primary-600 tracking-tighter">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span className="text-xl text-gray-400 line-through decoration-rose-500/30">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Offers & Deals Section (Flipkart Style) */}
            {settings?.offers && (
              <div className="space-y-4 pt-4 animate-fade-in">
                {/* Wow Deal Box */}
                {settings.offers.wowDeal?.enabled && (
                  <div className="bg-blue-600 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 text-white border border-blue-500">
                    <div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-white text-blue-700 font-black text-[10px] px-2 py-0.5 rounded tracking-wider">WOW! DEAL</span>
                        <span className="text-xs font-bold">{settings.offers.wowDeal.title}</span>
                      </div>
                      <SparklesIcon className="h-4 w-4 text-blue-200" />
                    </div>
                    <div className="p-5 bg-blue-50/10 backdrop-blur-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-100 font-medium">Effective Price after Deal</p>
                        <p className="text-2xl font-black tracking-tight text-white mt-0.5">
                          ₹{Math.round(displayPrice * (1 - (settings.offers.wowDeal.discountPercentage || 15) / 100)).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 backdrop-blur-md">
                          Save Extra {settings.offers.wowDeal.discountPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SuperCoin Benefit */}
                {settings.offers.superCoin?.enabled && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-2xl p-5 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
                        <StarSolid className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-wider">{settings.offers.superCoin.benefitTitle}</p>
                        <p className="text-xs text-amber-700 font-bold mt-0.5">
                          ₹{settings.offers.superCoin.pointsDiscount} off • Save extra ₹{settings.offers.superCoin.pointsDiscount} using 🪙 {settings.offers.superCoin.coinsRequired} SuperCoins
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toast.success(`SuperCoin benefit will be applied at checkout!`)}
                      className="text-xs font-black text-amber-600 uppercase bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-100 hover:bg-amber-50 transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Bank Offers */}
                {settings.offers.bankOffers?.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bank & Card Offers</h4>
                    <div className="space-y-2.5">
                      {settings.offers.bankOffers.map((offer, idx) => (
                        <div key={offer.id || idx} className="flex items-start gap-2.5 text-xs">
                          <span className="bg-emerald-50 text-emerald-600 p-1 rounded-lg mt-0.5 flex-shrink-0">
                            <CheckBadgeIcon className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <span className="font-bold text-gray-900">{offer.title}: </span>
                            <span className="text-gray-600 font-medium">{offer.description}</span>
                            <span className="ml-2 font-black text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 sm:mt-0">
                              Use Code {offer.code || 'SILAI5'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selection Area */}
            <div className="space-y-8 pt-6 border-t border-stone-200">
              {/* Color Swatches */}
              {product.colors?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Color</h3>
                    <span className="text-[10px] font-bold text-primary-600">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.name)}
                        className={`group relative p-1 rounded-full border-2 transition-all ${selectedColor === color.name ? 'border-primary-600 scale-110' : 'border-transparent hover:border-stone-200'}`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full shadow-inner border border-black/5" 
                          style={{ backgroundColor: color.code }}
                        />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Size</h3>
                    <button className="text-[9px] font-black text-primary-600 uppercase hover:underline decoration-bronze">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size.name)}
                        disabled={size.stock === 0}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSize === size.name
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105'
                          : 'bg-white text-gray-600 border-stone-200 hover:border-stone-400'
                        } disabled:opacity-30 disabled:bg-stone-50 disabled:cursor-not-allowed`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Inventory Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="w-full sm:w-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Quantity</h3>
                  <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-sm w-32">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-400 hover:text-primary-600 transition-colors"><MinusIcon className="h-4 w-4" /></button>
                    <span className="flex-1 text-center font-black text-gray-900 text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 text-gray-400 hover:text-primary-600 transition-colors"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                </div>
                {product.stock <= 10 && product.stock > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 w-full sm:w-auto animate-pulse">
                    <ArrowPathIcon className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-[10px] font-black text-amber-900 uppercase">Limited Edition Alert</p>
                      <p className="text-[9px] text-amber-700 font-bold">Only {product.stock} items left in vault</p>
                    </div>
                  </div>
                )}
                {/* Variant Stock Info */}
                {product && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const variant = product.variants?.find(v => 
                        (v.color === selectedColor || !v.color) && 
                        (v.size === selectedSize || !v.size)
                      );
                      const currentStock = variant ? variant.stock : product.stock;
                      
                      if (currentStock === 0) {
                        return (
                          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Currently Unavailable</span>
                          </div>
                        );
                      }
                      if (currentStock < 5) {
                        return (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                            <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Only {currentStock} left in stock</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest">In Stock & Ready to Ship</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" ref={mainActionRef}>
                {(() => {
                  const variant = product.variants?.find(v => 
                    (v.color === selectedColor || !v.color) && 
                    (v.size === selectedSize || !v.size)
                  );
                  const currentStock = variant ? variant.stock : product.stock;
                  const isOutOfStock = currentStock === 0;

                  return (
                    <>
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`group flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 ${isOutOfStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                          : 'bg-stone-900 text-white hover:bg-black shadow-2xl shadow-stone-200'
                        }`}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                      </button>
                      <QuickBuyButton product={product} variant={variant} />
                    </>
                  );
                })()}
              </div>
            </div>

              {/* Delivery Info Section */}
              <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-5">
                <div className="flex items-start gap-4">
                  <TruckIcon className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Standard Delivery</h4>
                    <p className="text-[11px] text-gray-500 font-bold">Get it by <span className="text-emerald-600">{getDeliveryDate()}</span></p>

                    {/* Pincode checker toggle */}
                    {!showPincodeChecker ? (
                      <button
                        onClick={() => setShowPincodeChecker(true)}
                        className="mt-1.5 text-[10px] font-black text-primary-600 uppercase tracking-wide hover:underline flex items-center gap-1"
                      >
                        <MapPinIcon className="h-3 w-3" />
                        Check availability in your area
                      </button>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={pincodeInput}
                            onChange={e => { setPincodeInput(e.target.value.replace(/\D/g, '')); setPincodeResult(null); }}
                            onKeyDown={e => e.key === 'Enter' && checkPincode()}
                            placeholder="Enter 6-digit pincode"
                            className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            autoFocus
                          />
                          <button
                            onClick={checkPincode}
                            disabled={pincodeLoading || pincodeInput.length !== 6}
                            className="h-9 px-4 bg-primary-600 text-white text-xs font-black rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                          >
                            {pincodeLoading ? '...' : 'Check'}
                          </button>
                          <button onClick={() => { setShowPincodeChecker(false); setPincodeResult(null); setPincodeInput(''); }} className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Result */}
                        {pincodeResult && (
                          <div className={`rounded-xl p-3 text-xs font-semibold flex items-start gap-2 ${
                            pincodeResult.serviceable ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {pincodeResult.serviceable
                              ? <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                              : <ExclamationCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-rose-500" />
                            }
                            <div>
                              {pincodeResult.serviceable ? (
                                <>
                                  <p className="font-black">
                                    {pincodeResult.city ? `${pincodeResult.city}, ` : ''}{pincodeResult.state}
                                  </p>
                                  <p>Delivery by <span className="font-black text-emerald-700">{pincodeResult.estimatedDelivery}</span></p>
                                  <div className="flex gap-3 mt-1">
                                    {pincodeResult.expressAvailable && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-black">⚡ Express Available</span>}
                                    {pincodeResult.cod && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-black">💵 COD Available</span>}
                                    {pincodeResult.freeDelivery && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-black">🎁 Free Delivery</span>}
                                  </div>
                                </>
                              ) : (
                                <p>{pincodeResult.message}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-stone-50">
                  <ShieldCheckIcon className="h-6 w-6 text-stone-800" />
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Secure Transaction</h4>
                    <p className="text-[11px] text-gray-500 font-bold">Trusted marketplace with 100% money-back guarantee</p>
                  </div>
                </div>
              </div>


            {/* Trust Badges */}
            <div className="flex items-center justify-around py-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-1">
                <CheckBadgeIcon className="h-5 w-5 text-gray-900" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Verified Artifact</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowPathIcon className="h-5 w-5 text-gray-900" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CalendarDaysIcon className="h-5 w-5 text-gray-900" />
                <span className="text-[8px] font-black uppercase tracking-tighter">24/7 Concierge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs & Specifications */}
        <div className="mt-20 lg:mt-32">
          <div className="flex items-center space-x-10 border-b border-stone-200 overflow-x-auto scrollbar-hide mb-10">
            {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap ${activeTab === tab ? 'text-primary-600' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full shadow-[0_-2px_8px_rgba(191,155,48,0.3)]" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              {activeTab === 'description' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <DocumentTextIcon className="h-8 w-8 text-stone-200" />
                    Product Story
                  </h3>
                  <div
                    className="prose prose-stone prose-lg max-w-none text-gray-600 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <ScaleIcon className="h-8 w-8 text-stone-200" />
                    Technical Details
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
                    {/* Unified Specifications from Virtual */}
                    <div className="divide-y divide-stone-50">
                      {product.allSpecifications && Object.entries(product.allSpecifications).map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center px-8 py-5 hover:bg-stone-50 transition-colors">
                          <span className="sm:w-1/3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-0">{key}</span>
                          <span className="text-sm font-bold text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                      {/* Fallback to material if not in allSpecifications */}
                      {!product.allSpecifications?.Material && product.material && (
                        <div className="flex flex-col sm:flex-row sm:items-center px-8 py-5 hover:bg-stone-50 transition-colors">
                          <span className="sm:w-1/3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-0">Material</span>
                          <span className="text-sm font-bold text-gray-900">{product.material}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-10 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform" />
                      <TruckIcon className="h-10 w-10 text-primary-600 mb-6 relative z-10" />
                      <h4 className="text-xl font-black text-gray-900 mb-4">Artisan Shipping</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">Each piece is professionally reinforced and hand-packed to ensure it arrives in pristine condition.</p>
                      <ul className="space-y-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <li className="flex items-center gap-2">✓ Multi-layer insurance</li>
                        <li className="flex items-center gap-2">✓ White-glove delivery</li>
                        <li className="flex items-center gap-2">✓ Eco-friendly packaging</li>
                      </ul>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm">
                      <ArrowPathIcon className="h-10 w-10 text-stone-800 mb-6" />
                      <h4 className="text-xl font-black text-gray-900 mb-4">Concierge Returns</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">Not satisfied? Our concierge will arrange a direct pickup for an effortless return process.</p>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Policy Period</p>
                        <p className="text-xs font-bold text-gray-900">7-Day Hassle-Free Window</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fade-in">
                  <CustomerReviews productId={product._id} />
                </div>
              )}
            </div>

            {/* Sidebar Suggestions */}
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                <SparklesIcon className="h-10 w-10 text-amber-400 mb-6" />
                <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">SilaiMart Promise</h4>
                <p className="text-sm text-stone-400 font-medium leading-relaxed mb-8">Every artifact on our platform undergoes a rigorous 5-point verification process by master artisans.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckBadgeIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Authenticity Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckBadgeIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Direct Artisan Sourcing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Artifacts */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">You May Also Like</h2>
                <p className="text-stone-400 text-xs font-black uppercase tracking-[0.4em] mt-2">More from our curated collection</p>
              </div>
              <Link to="/shop" className="text-[10px] font-black text-primary-600 uppercase tracking-widest border-b-2 border-primary-600/30 pb-1 hover:border-primary-600 transition-all">View All Collection</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related) => (
                <Link key={related._id} to={`/product/${related._id}`} className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 hover:border-primary-600/30 transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    {related.images?.[0]?.url ? (
                      <img src={related.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                        <SparklesIcon className="h-10 w-10 text-stone-200" />
                      </div>
                    )}
                    {related.discountPrice && (
                      <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {Math.round(((related.price - related.discountPrice) / related.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">{related.category?.name}</p>
                    <h3 className="font-black text-gray-900 uppercase tracking-tighter text-xl leading-tight mb-4 line-clamp-1 group-hover:text-primary-600 transition-colors">{related.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900">₹{(related.discountPrice || related.price).toLocaleString()}</span>
                        {related.discountPrice && (
                          <span className="text-gray-400 line-through text-xs font-bold">₹{related.price.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="w-8 h-8 bg-stone-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <PlusIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ProductDetail;