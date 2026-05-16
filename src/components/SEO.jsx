import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component
 * Manages canonical tags, meta tags, and OpenGraph consistency.
 * 
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} image - OG image URL
 * @param {string} type - OG type (product, website, etc.)
 * @param {string} canonicalPath - Manual override for canonical path
 */
const SEO = ({ 
  title, 
  description, 
  image, 
  type = 'website', 
  canonicalPath 
}) => {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://silaimart.in';
  
  // 1. Generate Canonical URL
  // Strip query parameters and enforce lowercase for canonical link
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${baseUrl}${currentPath.toLowerCase()}`.replace(/\/$/, '');

  useEffect(() => {
    // 2. Update Document Title
    if (title) {
      document.title = `${title} | SilaiMart`;
    }

    // 3. Manage Meta Tags
    const updateMetaTag = (property, content, isProperty = false) => {
      if (!content) return;
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) element.setAttribute('property', property);
        else element.setAttribute('name', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', canonicalUrl, true);
    if (image) updateMetaTag('og:image', image, true);

    // 4. Manage Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Cleanup (Optional: remove tags on unmount if needed, but usually kept for SEO)
  }, [title, description, image, type, canonicalUrl]);

  return null; // This component doesn't render anything UI-wise
};

export default SEO;
