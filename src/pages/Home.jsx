import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI, api } from '../services/api';
import {
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PhotoIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  PhoneArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import HeroCarousel from '../components/HeroCarousel';
import DiscoveryCarousel from '../components/DiscoveryCarousel';
import RecentlyViewed from '../components/RecentlyViewed';

/* ── Promotional tiles shown below hero ─────────────────────────── */
const PROMO_TILES = [
  {
    id: 'sculptures',
    label: 'Sculptures',
    sublabel: 'From ₹999',
    badge: 'Most Loved',
    badgeColor: 'bg-violet-100 text-violet-700',
    bg: 'bg-gradient-to-br from-violet-50 to-violet-100',
    accent: 'border-violet-200',
    image: 'https://images.unsplash.com/photo-1608501947097-86951ad73fea?q=80&w=600',
    path: '/shop?category=sculptures',
  },
  {
    id: 'home-decor',
    label: 'Home Decor',
    sublabel: 'Handcrafted',
    badge: 'New In',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    accent: 'border-emerald-200',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600',
    path: '/shop?category=home-decor',
  },
  {
    id: 'spiritual',
    label: 'Spiritual',
    sublabel: 'Sacred gifts',
    badge: 'Top Rated',
    badgeColor: 'bg-amber-100 text-amber-700',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
    accent: 'border-amber-200',
    image: 'https://images.unsplash.com/photo-1573126617899-41f1dffb196c?q=80&w=600',
    path: '/shop?category=spiritual',
  },
  {
    id: 'offers',
    label: 'Offers',
    sublabel: 'Up to 40% off',
    badge: '🔥 Hot Deals',
    badgeColor: 'bg-rose-100 text-rose-700',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-100',
    accent: 'border-rose-200',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600',
    path: '/shop?sort=discount',
  },
];

/* ── Trust strip items ──────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: TruckIcon, label: 'Free Shipping', sub: 'On orders above ₹25,000' },
  { icon: ShieldCheckIcon, label: 'Secure Payment', sub: '100% safe & encrypted' },
  { icon: CheckBadgeIcon, label: 'Verified Artisans', sub: 'Authenticity guaranteed' },
  { icon: ArrowPathIcon, label: 'Easy Returns', sub: '7-day hassle-free policy' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, trendingRes, bestSellerRes, categoriesRes, bannersRes] = await Promise.all([
        productsAPI.getProducts({ featured: true, limit: 8 }),
        productsAPI.getProducts({ trending: true, limit: 8 }),
        productsAPI.getProducts({ bestSeller: true, limit: 8 }),
        categoriesAPI.getCategories({ limit: 8 }),
        api.get('/banners?position=hero&active=true'),
      ]);
      setFeaturedProducts(productsRes.data.products || []);
      setTrendingProducts(trendingRes.data.products || []);
      setBestSellers(bestSellerRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
      setHeroBanners(bannersRes.data.banners || []);
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-primary-600" />
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Carousel ─────────────────────────────────────────── */}
      <HeroCarousel banners={heroBanners} />

      {/* ── Promotional Grid ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {PROMO_TILES.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
            >
              <Link
                to={tile.path}
                className={`group flex flex-col rounded-2xl border ${tile.accent} ${tile.bg} overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
              >
                {/* Image */}
                <div className="relative h-28 sm:h-36 overflow-hidden">
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tile.badgeColor}`}>
                    {tile.badge}
                  </span>
                </div>
                {/* Text */}
                <div className="p-3 sm:p-4">
                  <p className="font-black text-gray-900 text-sm sm:text-base leading-tight">{tile.label}</p>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">{tile.sublabel}</p>
                  <span className="inline-flex items-center gap-1 text-primary-600 text-[10px] font-black uppercase tracking-wider mt-2 group-hover:gap-2 transition-all">
                    Shop <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Trust Strip ───────────────────────────────────────────── */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 py-4 px-4">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-gray-900 uppercase tracking-wide leading-tight">{label}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Carousels ─────────────────────────────────────── */}
      <div className="space-y-2 py-4">
        <DiscoveryCarousel
          title="Trending Now"
          subtitle="Most loved by our community"
          products={trendingProducts}
          loading={loading}
        />

        {/* ── Category Quick-Browse ──── */}
        {categories.length > 0 && (
          <section className="bg-white py-8 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">Shop by Category</h2>
                  <p className="text-gray-400 text-xs font-medium mt-0.5">Browse our handpicked collections</p>
                </div>
                <Link to="/shop" className="text-primary-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  All <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                {categories.slice(0, 8).map((cat, i) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/shop?category=${cat._id}`}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-primary-300 group-hover:shadow-md transition-all duration-200">
                        {cat.image?.url ? (
                          <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="h-7 w-7 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 text-center group-hover:text-primary-600 transition-colors leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <DiscoveryCarousel
          title="Best Sellers"
          subtitle="Timeless pieces for your home"
          products={bestSellers}
          loading={loading}
        />

        {/* ── Recently Viewed ───────── */}
        <div className="bg-white border-y border-gray-100 py-8">
          <RecentlyViewed />
        </div>
      </div>

      {/* ── Artisan Story Banner ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative rounded-3xl overflow-hidden bg-stone-950 min-h-[220px] flex items-center">
          {/* BG image */}
          <img
            src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2000"
            alt="Artisans"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />

          <div className="relative z-10 px-8 sm:px-12 py-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <CheckBadgeIcon className="h-3.5 w-3.5" />
              Guaranteed Authenticity
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              Handcrafted by<br />
              <span className="text-primary-400">Master Artisans</span>
            </h2>
            <p className="text-stone-400 text-sm font-medium leading-relaxed mb-6 max-w-sm">
              Every piece is meticulously crafted by traditional artisans from across India — each telling a unique story of heritage and skill.
            </p>
            <div className="flex gap-3">
              <Link to="/about" className="bg-white text-gray-900 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all">
                Learn More
              </Link>
              <Link to="/shop" className="bg-primary-600 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-primary-500 transition-all">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
