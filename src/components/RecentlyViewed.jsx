import { useState, useEffect } from 'react';
import DiscoveryCarousel from './DiscoveryCarousel';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed products');
      }
    }
  }, []);

  if (recentProducts.length === 0) return null;

  return (
    <DiscoveryCarousel 
      title="Recently Viewed" 
      subtitle="Continue your artisan discovery" 
      products={recentProducts} 
      loading={false}
    />
  );
};

export const trackProductView = (product) => {
  if (!product || !product._id) return;
  
  const stored = localStorage.getItem('recentlyViewed');
  let recent = stored ? JSON.parse(stored) : [];
  
  // Remove if already exists to move to front
  recent = recent.filter(p => p._id !== product._id);
  
  // Add to front
  recent.unshift({
    _id: product._id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    images: product.images,
    category: product.category,
    rating: product.rating
  });
  
  // Limit to 10
  recent = recent.slice(0, 10);
  
  localStorage.setItem('recentlyViewed', JSON.stringify(recent));
};

export default RecentlyViewed;
