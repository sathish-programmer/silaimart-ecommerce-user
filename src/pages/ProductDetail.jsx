import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  StarIcon as StarOutline
} from '@heroicons/react/24/outline';
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
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data.product);
      setReviews(response.data.reviews || []);
      if (response.data.product.sizes?.length > 0) {
        setSelectedSize(response.data.product.sizes[0].name);
      }
      if (response.data.product.colors?.length > 0) {
        setSelectedColor(response.data.product.colors[0].name);
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
    const selectedProduct = {
      ...product,
      selectedSize,
      selectedColor
    };
    addItem(selectedProduct, quantity);
    toast.success(`Divine piece added to your collection!`);
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
          text: product.description?.replace(/<[^>]*>/g, ''),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Sanctuary link copied!');
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-primary-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/shop" className="btn-primary">Return to Sanctuary</Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-stone-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Breadcrumb & Back */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Gallery</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className={`card-premium overflow-hidden relative group cursor-crosshair`}>
              <div
                className="aspect-square relative"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                {product.images?.[selectedImage]?.url ? (
                  <>
                    <img
                      src={product.images[selectedImage].url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {showZoom && (
                      <div
                        className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        style={{
                          backgroundImage: `url(${product.images[selectedImage].url})`,
                          backgroundSize: '200%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <SparklesIcon className="h-20 w-20 text-stone-200" />
                  </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {product.discountPrice && (
                    <div className="bg-rose-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                      -{discountPercentage}% Off
                    </div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                      Rare: {product.stock} Left
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 right-6 z-20">
                  <button
                    onClick={() => {
                      if (isInWishlist(product._id)) {
                        removeFromWishlist(product._id);
                      } else {
                        addToWishlist(product);
                      }
                    }}
                    className={`p-4 rounded-2xl shadow-2xl transition-all ${isInWishlist(product._id) ? 'bg-rose-600 text-white' : 'bg-white text-gray-400 hover:text-rose-600'
                      }`}
                  >
                    <HeartIcon className={`h-6 w-6 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 ${selectedImage === index
                      ? 'border-primary-600 bg-primary-50 scale-105 shadow-lg shadow-primary-100'
                      : 'border-white bg-white hover:border-gray-200 shadow-sm'
                      }`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {product.category?.name}
                </span>
                {product.rating?.count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarSolid className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-gray-900">{product.rating.average.toFixed(1)}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">({product.rating.count} Insights)</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Catalogue Ref: {product.sku}</p>
              )}
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-2xl text-gray-600 line-through decoration-rose-500/30">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 self-end mb-2">Incl. Sacred Taxes</span>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Material</p>
                <p className="text-sm font-bold text-gray-900">{product.sculptureDetails?.stone || 'Divine Stone'}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Origin</p>
                <p className="text-sm font-bold text-gray-900">{product.sculptureDetails?.origin || 'Varanasi'}</p>
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-8 py-8 border-y border-gray-100">
              {product.sizes?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Select Dimension</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size.name)}
                        disabled={size.stock === 0}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSize === size.name
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-100 scale-105'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-primary-200'
                          } disabled:opacity-30`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end justify-between">
                <div className="flex-1 max-w-[160px]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Quantity</h3>
                  <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-400 hover:text-primary-600 transition-colors"><MinusIcon className="h-4 w-4" /></button>
                    <span className="flex-1 text-center font-black text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 text-gray-400 hover:text-primary-600 transition-colors"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="text-right pb-2">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    Status: {product.stock > 0 ? 'Sanctuary Available' : 'Currently Departed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-[1.5] btn-primary py-5 rounded-[2rem] flex items-center justify-center gap-3"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="uppercase tracking-[0.2em] text-[10px] font-black">Add to Collection</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 btn-outline py-5 rounded-[2rem] hover:bg-stone-50"
                >
                  <span className="uppercase tracking-[0.2em] text-[10px] font-black">Acquire Now</span>
                </button>
              </div>
              <button onClick={handleShare} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
                <ShareIcon className="h-4 w-4" /> Share This Divine Piece
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
              <div className="flex flex-col items-center text-center">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-500 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Authentic Heritage</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <TruckIcon className="h-6 w-6 text-primary-500 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Global Sanctuary</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <StarOutline className="h-6 w-6 text-amber-500 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Master Craftsmanship</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mb-32">
          <div className="flex flex-wrap border-b border-gray-100 mb-10 gap-8">
            {[
              { id: 'description', label: 'Chronicle', icon: DocumentTextIcon },
              { id: 'specifications', label: 'Sanctuary Details', icon: ScaleIcon },
              { id: 'shipping', label: 'Transit & Return', icon: TruckIcon },
              { id: 'reviews', label: 'Seeker Insights', icon: StarOutline }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-6 px-1 border-b-2 transition-all group ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-900'
                  }`}
              >
                <tab.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              {activeTab === 'description' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">The Chronicle</h3>
                  <div
                    className="prose prose-stone prose-lg max-w-none text-gray-600 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                  {product.sculptureDetails?.artisan && (
                    <div className="bg-stone-50 rounded-[2rem] p-8 border border-gray-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-600 mb-2">Heritage Maker</h4>
                      <p className="text-gray-900 font-bold">{product.sculptureDetails.artisan}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-10 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Dimensions & Essence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {[
                      { label: 'Stone Type', value: product.sculptureDetails?.stone },
                      { label: 'Final Polish', value: product.sculptureDetails?.finish },
                      { label: 'Artisan Technique', value: product.sculptureDetails?.technique },
                      { label: 'Net Weight', value: product.weight ? `${product.weight} Sacred Units` : null },
                      { label: 'Dimensions', value: product.dimensions ? `${product.dimensions.length}" × ${product.dimensions.width}" × ${product.dimensions.height}"` : null },
                      { label: 'Origin Sanctuary', value: product.sculptureDetails?.origin }
                    ].filter(i => i.value).map((item, idx) => (
                      <div key={idx} className="flex justify-between py-4 border-b border-gray-50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-10 animate-fade-in">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Transit Wisdom</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                      <TruckIcon className="h-8 w-8 text-primary-600 mb-4" />
                      <h4 className="text-lg font-black text-gray-900 mb-4">Secure Passage</h4>
                      <ul className="space-y-3 text-sm text-gray-500 font-medium">
                        <li>• Custom reinforced sanctuary packaging</li>
                        <li>• Fully insured divine transit</li>
                        <li>• Real-time spiritual tracking</li>
                        <li>• 7-10 days for hand-delivery</li>
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                      <ArrowLeftIcon className="h-8 w-8 text-rose-600 mb-4" />
                      <h4 className="text-lg font-black text-gray-900 mb-4">Harmony Return</h4>
                      <ul className="space-y-3 text-sm text-gray-500 font-medium">
                        <li>• 7-day divine inspection period</li>
                        <li>• Hassel-free transition policy</li>
                        <li>• Respectful returns for misaligned spirits</li>
                      </ul>
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

            {/* Sidebar Details */}
            <div className="space-y-10">
              <div className="card-premium p-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Celestial Offerings</h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Handcrafted Soul</p>
                      <p className="text-[10px] text-gray-400 font-medium">Each piece carries the artisan's personal signature.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Lifetime Sanctity</p>
                      <p className="text-[10px] text-gray-400 font-medium">Authenticity certificate accompanies the piece.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Sacred Kinship</h2>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.3em]">More divine creations you may resonate with</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related) => (
                <Link key={related._id} to={`/product/${related._id}`} className="card-premium group">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    {related.images?.[0]?.url ? (
                      <img src={related.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center" />
                    )}
                    {related.discountPrice && (
                      <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">-{Math.round(((related.price - related.discountPrice) / related.price) * 100)}%</div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-[8px] font-black text-primary-600 uppercase tracking-[0.3em] mb-2">{related.category?.name}</p>
                    <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg leading-tight mb-3 line-clamp-2">{related.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-900">₹{(related.discountPrice || related.price).toLocaleString()}</span>
                      {related.discountPrice && (
                        <span className="text-gray-600 line-through text-sm">₹{related.price.toLocaleString()}</span>
                      )}
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