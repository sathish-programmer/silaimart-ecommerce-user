import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { SparklesIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getProducts({ featured: true, limit: 6 }),
        categoriesAPI.getCategories({ limit: 8 })
      ]);
      setFeaturedProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <br />
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
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Sacred Categories</h2>
            <p className="section-subtitle">Explore our divine collection</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((category) => (
              <Link key={category._id} to={`/shop?category=${category._id}`} className="group">
                <div className="bg-stone-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    {category.image?.url ? (
                      <>
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center" style={{ display: 'none' }}>
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                              <SparklesIcon className="w-6 h-6 text-violet-500" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <SparklesIcon className="w-6 h-6 text-violet-500" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-base group-hover:text-amber-300 transition-colors drop-shadow">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Featured Sculptures</h2>
              <p className="section-subtitle">Handpicked masterpieces</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-semibold text-sm group">
              View all
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <Link key={product._id} to={`/product/${product._id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 group-hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SparklesIcon className="w-16 h-16 text-violet-200" />
                      </div>
                    )}
                    {product.discountPrice && (
                      <div className="absolute top-3 left-3 bg-secondary-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary-600 font-bold text-xl">
                        ₹{(product.discountPrice || product.price)?.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              View All Products
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
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