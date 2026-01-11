import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
      }, 5000); // Auto-slide every 5 seconds

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
    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative h-64 md:h-80 lg:h-96 flex items-center">
        {/* Background Image */}
        {banner.image?.url ? (
          <img 
            src={banner.image.url} 
            alt={banner.image.alt || banner.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = banner.backgroundColor || '#CD7F32';
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-bronze via-gold to-bronze"
            style={{ backgroundColor: banner.backgroundColor || '#CD7F32' }}
          />
        )}
        
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in"
              style={{ color: banner.textColor || '#FFFFFF' }}
            >
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p 
                className="text-xl md:text-2xl lg:text-3xl mb-6 font-medium animate-fade-in-delay-1"
                style={{ color: banner.textColor || '#FFFFFF' }}
              >
                {banner.subtitle}
              </p>
            )}
            {banner.description && (
              <p 
                className="text-base md:text-lg lg:text-xl mb-8 opacity-90 max-w-2xl leading-relaxed animate-fade-in-delay-2"
                style={{ color: banner.textColor || '#FFFFFF' }}
              >
                {banner.description}
              </p>
            )}
            {banner.link?.url && banner.link?.text && (
              <a
                href={banner.link.url}
                target={banner.link.target || '_self'}
                className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-delay-3 group"
                style={{
                  backgroundColor: banner.buttonColor || '#D4AF37',
                  color: '#000000'
                }}
              >
                {banner.link.text}
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Enhanced Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            >
              <ChevronLeftIcon className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 group"
            >
              <ChevronRightIcon className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Enhanced Dots indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentBanner 
                    ? 'w-8 h-3 bg-white shadow-lg' 
                    : 'w-3 h-3 bg-white/50 hover:bg-white/70 hover:scale-125'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay-1 {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
};

export default ShopBanner;