import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ShopBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/banners?position=shop-top&active=true`);
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const banner = banners[currentBanner];

  return (
    <div className="relative mb-16 group">
      <div className="relative h-[300px] md:h-[380px] lg:h-[420px] overflow-hidden rounded-[3rem] shadow-2xl shadow-gray-200/50">
        {/* Background Layer */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          {banner.image?.url ? (
            <img
              src={banner.image.url}
              alt={banner.image.alt || banner.title}
              className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-10000 linear"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.backgroundColor = banner.backgroundColor || '#7c3aed';
              }}
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900"
              style={{ backgroundColor: banner.backgroundColor }}
            />
          )}

          {/* Refined Overlays */}
          {banner.title && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
            </>
          )}
        </div>

        {/* Content Layer */}
        {banner.title && (
          <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
            <div className="max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[3rem] shadow-2xl animate-fade-in transition-all">
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="h-5 w-5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Divine Collection</span>
              </div>

              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.05] tracking-tighter drop-shadow-sm uppercase"
                style={{ color: banner.textColor || '#FFFFFF' }}
              >
                {banner.title}
              </h2>

              {banner.subtitle && (
                <p
                  className="text-xl md:text-2xl mb-8 font-bold opacity-90 tracking-tight"
                  style={{ color: banner.textColor || '#FFFFFF' }}
                >
                  {banner.subtitle}
                </p>
              )}

              {banner.link?.url && banner.link?.text && (
                <a
                  href={banner.link.url}
                  target={banner.link.target || '_self'}
                  className="inline-flex items-center px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105 hover:shadow-2xl active:scale-95 group/btn"
                  style={{
                    backgroundColor: banner.buttonColor || '#FFFFFF',
                    color: '#000000'
                  }}
                >
                  {banner.link.text}
                  <ChevronRightIcon className="ml-3 w-4 h-4 group-hover/btn:translate-x-1 transition-transform stroke-[3]" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Navigation Overlays */}
        {banners.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={prevBanner}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-black transition-all hover:scale-110"
              >
                <ChevronLeftIcon className="h-6 w-6 stroke-[3]" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={nextBanner}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full hover:bg-white hover:text-black transition-all hover:scale-110"
              >
                <ChevronRightIcon className="h-6 w-6 stroke-[3]" />
              </button>
            </div>
          </>
        )}

        {/* Dynamic Pagination */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`transition-all duration-500 rounded-full h-1.5 ${index === currentBanner
                  ? 'w-10 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ShopBanner;