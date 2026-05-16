import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/* ── Default fallback banners ───────────────────────────────── */
const defaultBanners = [
  {
    _id: '1',
    image: { url: 'https://images.unsplash.com/photo-1608501947097-86951ad73fea?q=80&w=1400&auto=format&fit=crop' },
    title: 'Divine Artistry',
    subtitle: 'Handcrafted sculptures for sacred spaces',
    cta: 'Shop Now',
    link: '/shop',
    badge: 'New Arrivals',
    bgColor: '#1e1b4b',
  },
  {
    _id: '2',
    image: { url: 'https://images.unsplash.com/photo-1573126617899-41f1dffb196c?q=80&w=1400&auto=format&fit=crop' },
    title: 'Sacred Spaces',
    subtitle: 'Timeless décor for contemporary homes',
    cta: 'Explore',
    link: '/shop?trending=true',
    badge: 'Trending',
    bgColor: '#1c1917',
  },
  {
    _id: '3',
    image: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1400&auto=format&fit=crop' },
    title: 'Best Sellers',
    subtitle: 'Most loved by our community',
    cta: 'View All',
    link: '/shop?bestSeller=true',
    badge: 'Best Sellers',
    bgColor: '#0c0a09',
  },
];

/* ── Side promo tiles (static — admin can extend later) ──── */
const SIDE_TILES = [
  {
    id: 'new',
    label: 'New Arrivals',
    sub: 'Fresh every week',
    img: 'https://images.unsplash.com/photo-1608501947097-86951ad73fea?q=80&w=400',
    path: '/shop?newArrival=true',
    bg: 'bg-violet-50',
    badge: '🆕',
  },
  {
    id: 'offers',
    label: 'Hot Offers',
    sub: 'Up to 40% off',
    img: 'https://images.unsplash.com/photo-1573126617899-41f1dffb196c?q=80&w=400',
    path: '/shop?sort=discount',
    bg: 'bg-rose-50',
    badge: '🔥',
  },
];

/* ─────────────────────────────────────────────────────────── */

const HeroCarousel = ({ banners = [] }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const data = banners.length > 0 ? banners : defaultBanners;

  const next = useCallback(() => setCurrent((p) => (p + 1) % data.length), [data.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + data.length) % data.length), [data.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused]);

  const b = data[current];

  return (
    <div className="bg-white px-0">
      <div className="max-w-[1400px] mx-auto">
        {/* ── Flipkart-style: Main slider (left) + 2 side tiles (right) ── */}
        <div className="flex gap-0.5 bg-gray-100" style={{ height: '260px' }}>

          {/* Main Carousel — 70% width */}
          <div
            className="relative overflow-hidden flex-1"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <img
                  src={b.image?.url || b.image}
                  alt={b.title || ''}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 30%' }}
                />
                {/* Subtle gradient only on left for text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Text overlay */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="absolute inset-0 flex flex-col justify-center px-8 z-10"
              >
                <span className="inline-block bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 w-fit">
                  {b.badge || 'Featured'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 max-w-xs">
                  {b.title}
                </h2>
                <p className="text-white/70 text-sm mb-4 max-w-xs">{b.subtitle}</p>
                <Link
                  to={b.link || '/shop'}
                  className="w-fit bg-white text-gray-900 text-xs font-black uppercase tracking-widest px-5 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  {b.cta || 'Shop Now'}
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-700" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {data.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side tiles — 30% width, stacked */}
          <div className="flex flex-col gap-0.5 w-[280px] flex-shrink-0">
            {SIDE_TILES.map((tile) => (
              <Link
                key={tile.id}
                to={tile.path}
                className="relative flex-1 overflow-hidden group"
              >
                <img
                  src={tile.img}
                  alt={tile.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-wide">{tile.badge}</span>
                  <p className="text-sm font-black text-white leading-tight">{tile.label}</p>
                  <p className="text-[10px] text-white/70 font-medium">{tile.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
