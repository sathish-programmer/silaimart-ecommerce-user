import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SparklesIcon,
  HomeModernIcon,
  BuildingLibraryIcon,
  GiftIcon,
  SunIcon,
  TagIcon,
  FireIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolid,
} from '@heroicons/react/24/solid';

const STATIC_CATS = [
  { name: 'For You', icon: SparklesIcon, activeSolid: SparklesSolid, path: '/shop', exact: true },
  { name: 'Sculptures', icon: BuildingLibraryIcon, path: '/shop?category=sculptures' },
  { name: 'Home Decor', icon: HomeModernIcon, path: '/shop?category=home-decor' },
  { name: 'Spiritual', icon: SunIcon, path: '/shop?category=spiritual' },
  { name: 'Artifacts', icon: GiftIcon, path: '/shop?category=artifacts' },
  { name: 'Trending', icon: FireIcon, path: '/shop?trending=true' },
  { name: 'Best Sellers', icon: StarIcon, path: '/shop?bestSeller=true' },
  { name: 'Offers', icon: TagIcon, path: '/shop?sort=discount' },
];

const CategoryBar = () => {
  const location = useLocation();
  const [active, setActive] = useState(null);

  useEffect(() => {
    // Find which item matches current URL
    const match = STATIC_CATS.find((c) => {
      if (c.exact) return location.pathname === c.path && !location.search;
      const catPath = c.path.split('?')[0];
      const catSearch = c.path.includes('?') ? c.path.split('?')[1] : '';
      return location.pathname === catPath && location.search.includes(catSearch);
    });
    setActive(match?.name || null);
  }, [location]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STATIC_CATS.map((cat) => {
            const isActive = active === cat.name;
            const Icon = isActive && cat.activeSolid ? cat.activeSolid : cat.icon;
            return (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setActive(cat.name)}
                className={`group relative flex flex-col items-center justify-center gap-1.5 px-4 sm:px-5 pt-3 pb-2.5 flex-shrink-0 transition-colors duration-150 ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50'
                      : 'bg-transparent group-hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-150 ${
                      isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-150 ${
                    isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {cat.name}
                </span>

                {/* Active underline */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full transition-all duration-200 ${
                    isActive ? 'bg-primary-600 opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
