import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI, api } from '../services/api';
import { SparklesIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        productsAPI.getProducts({ featured: true, limit: 6 }),
        categoriesAPI.getCategories({ limit: 8 }),
        api.get('/banners?position=hero&active=true')
      ]);
      setFeaturedProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
      setHeroBanners(bannersRes.data.banners || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCategories([
        { _id: '1', name: 'Vinayagar', image: { url: 'https://via.placeholder.com/300x300?text=Vinayagar' } },
        { _id: '2', name: 'Murugar', image: { url: 'https://via.placeholder.com/300x300?text=Murugar' } },
        { _id: '3', name: 'Buddha', image: { url: 'https://via.placeholder.com/300x300?text=Buddha' } },
        { _id: '4', name: 'Home Decor', image: { url: 'https://via.placeholder.com/300x300?text=Home+Decor' } }
      ]);
      setFeaturedProducts([
        { _id: '1', name: 'Divine Vinayagar Statue', price: 2500, discountPrice: 2000, images: [{ url: '' }] },
        { _id: '2', name: 'Peaceful Buddha', price: 3500, images: [{ url: '' }] },
        { _id: '3', name: 'Lord Murugar Sculpture', price: 4500, discountPrice: 3500, images: [{ url: '' }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: SparklesIcon, title: 'Handcrafted', desc: 'Artisan-made with devotion' },
    { icon: ShieldCheckIcon, title: 'Authentic', desc: 'Genuine spiritual sculptures' },
    { icon: TruckIcon, title: 'Safe Delivery', desc: 'Packed with care, delivered fast' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Hero Skeleton */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
          <div className="text-center max-w-4xl mx-auto px-4 space-y-6">
            <div className="h-16 bg-white/10 rounded-2xl w-96 mx-auto animate-pulse" />
            <div className="h-8 bg-white/10 rounded-xl w-80 mx-auto animate-pulse" />
            <div className="flex justify-center gap-4">
              <div className="h-14 bg-white/10 rounded-2xl w-40 animate-pulse" />
              <div className="h-14 bg-white/10 rounded-2xl w-36 animate-pulse" />
            </div>
          </div>
        </section>
        {/* Categories Skeleton */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 bg-gray-200 rounded-xl w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero Section ── */}
      {heroBanners.length > 0 ? (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {heroBanners.map((banner, index) => (
            <div key={banner._id} className={`absolute inset-0 transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 motion-safe:animate-[zoom_20s_infinite_alternate]"
                style={{
                  backgroundImage: banner.image?.url ? `url(${banner.image.url})` : 'none',
                  backgroundColor: banner.backgroundColor || '#1c1917'
                }}
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

              {(banner.title || banner.subtitle || banner.description) && (
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 h-full flex flex-col items-center justify-center">
                  {banner.subtitle && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-8"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      {banner.subtitle}
                    </motion.div>
                  )}

                  {banner.title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl md:text-8xl font-black mb-6 leading-tight text-white tracking-tighter"
                      style={{ color: banner.textColor }}
                    >
                      {banner.title}
                    </motion.h1>
                  )}

                  {banner.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                      {banner.description}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <Link
                      to={banner.link?.url || '/shop'}
                      className="group inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-2xl shadow-amber-900/40 hover:scale-105 active:scale-95"
                      style={{ backgroundColor: banner.buttonColor }}
                    >
                      {banner.link?.text || 'Explore Sanctuary'}
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          ))}

          {/* Fallback pattern if no image */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%"><pattern id="hero-pattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#hero-pattern)" /></svg>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
              <div className="w-1.5 h-2 bg-amber-400 rounded-full" />
            </div>
          </div>
        </section>
      ) : (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900" />
          {/* Decorative orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <SparklesIcon className="h-4 w-4" />
              Handcrafted Divine Sculptures
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Sacred Art,</span>
              {' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Divine Beauty
              </span>
            </h1>

            <p className="text-lg md:text-xl text-violet-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Handcrafted spiritual sculptures and divine art — bringing blessings and beauty to your sacred spaces
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/30 hover:shadow-xl"
              >
                Shop Now
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 backdrop-blur-sm"
              >
                Our Story
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-white/10">
              {[
                { value: '500+', label: 'Sculptures' },
                { value: '10K+', label: 'Happy Customers' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-violet-300 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-violet-300 animate-bounce">
            <div className="w-5 h-8 border-2 border-violet-300/50 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-violet-300 rounded-full animate-bounce" />
            </div>
          </div>
        </section>
      )}

      {/* ── Features Strip ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
              <div className="h-[1px] w-8 bg-primary-200"></div>
              Divine Collections
              <div className="h-[1px] w-8 bg-primary-200"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
              Sacred <span className="text-secondary-600 italic font-serif">Categories</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto mt-4">
              Explore our curated selection of spiritual masterpieces, meticulously categorized by divine presence and artistic style.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, i) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/shop?category=${category._id}`} className="group block h-full">
                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-amber-900/10 group-hover:-translate-y-2 group-hover:rounded-[2rem]">
                    {category.image?.url ? (
                      <img
                        src={category.image.url}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white flex items-center justify-center p-8"
                      style={{ display: category.image?.url ? 'none' : 'flex' }}
                    >
                      <div className="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white">
                        <SparklesIcon className="w-8 h-8 text-stone-300" />
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 opacity-60 group-hover:opacity-80" />

                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <motion.div
                        initial={{ y: 0 }}
                        whileHover={{ y: -10 }}
                        className="space-y-2"
                      >
                        <h3 className="text-white font-black text-xl md:text-2xl tracking-tight leading-none group-hover:text-amber-300 transition-colors drop-shadow">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                          <span className="text-amber-300 text-[10px] font-black uppercase tracking-[0.2em]">Explore Collection</span>
                          <ArrowRightIcon className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-3xl transition-all duration-700 scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.3em] bg-amber-50 px-3 py-1 rounded-full border border-amber-100 mb-2">
                <SparklesIcon className="h-3 w-3" />
                Featured Collection
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                Masterpiece <span className="text-primary-600">Sculptures</span>
              </h2>
              <p className="text-gray-500 font-medium max-w-lg">
                Discover our handpicked selection of divine art, each carrying a story of devotion and craftsmanship.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/shop" className="group flex items-center gap-3 bg-stone-50 hover:bg-stone-100 px-6 py-3 rounded-2xl transition-all duration-300 border border-gray-100">
                <span className="font-bold text-sm text-gray-900 uppercase tracking-widest">Explore All</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group h-full"
              >
                <Link to={`/product/${product._id}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-50 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary-100/50 group-hover:-translate-y-2">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-stone-100 to-stone-50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                          <svg width="100%" height="100%"><pattern id={`grid-home-${i}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill={`url(#grid-home-${i})`} /></svg>
                        </div>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-stone-100 rotate-3 transition-transform duration-500 group-hover:rotate-0">
                          <PhotoIcon className="w-10 h-10 text-stone-200" />
                        </div>
                        <span className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">Divine Art</span>
                      </div>
                    )}

                    {/* Badge */}
                    {product.discountPrice && (
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md border border-amber-100 text-amber-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                      </div>
                    )}

                    {/* Action Float */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                        <span className="text-primary-600 font-black text-lg">₹{(product.discountPrice || product.price)?.toLocaleString()}</span>
                        <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
                          <ShoppingBagIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 px-4 flex flex-col items-center text-center flex-grow">
                    <h3 className="text-gray-900 font-black text-xl mb-3 tracking-tight group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em] mb-4">{product.category?.name || 'Sanctuary Art'}</p>

                    <div className="mt-auto flex items-center gap-3">
                      <div className="h-[1px] w-8 bg-stone-200"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Detailed View</span>
                      <div className="h-[1px] w-8 bg-stone-200"></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4" />
            AI-Powered Recommendations
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Need Help Choosing?
          </h2>
          <p className="text-violet-200 text-lg mb-8 max-w-2xl mx-auto">
            Our AI assistant can guide you to the perfect divine sculpture based on your sacred space and preferences.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/30"
          >
            Explore Collection
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;