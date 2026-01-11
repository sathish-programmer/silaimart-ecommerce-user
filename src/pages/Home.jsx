import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';

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
      // Set mock data for demo
      setCategories([
        { _id: '1', name: 'Vinayagar', image: { url: 'https://via.placeholder.com/300x300?text=Vinayagar' } },
        { _id: '2', name: 'Murugar', image: { url: 'https://via.placeholder.com/300x300?text=Murugar' } },
        { _id: '3', name: 'Buddha', image: { url: 'https://via.placeholder.com/300x300?text=Buddha' } },
        { _id: '4', name: 'Home Decor', image: { url: 'https://via.placeholder.com/300x300?text=Home+Decor' } }
      ]);
      setFeaturedProducts([
        { _id: '1', name: 'Divine Vinayagar Statue', price: 2500, discountPrice: 2000, images: [{ url: 'https://via.placeholder.com/400x400?text=Vinayagar' }] },
        { _id: '2', name: 'Peaceful Buddha', price: 3500, images: [{ url: 'https://via.placeholder.com/400x400?text=Buddha' }] },
        { _id: '3', name: 'Lord Murugar Sculpture', price: 4500, discountPrice: 3500, images: [{ url: 'https://via.placeholder.com/400x400?text=Murugar' }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Hero Skeleton */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black">
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="h-16 bg-gray-800 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-800 rounded w-80 mx-auto mb-8 animate-pulse"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-12 bg-gray-800 rounded-lg w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-800 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Categories Skeleton */}
        <section className="py-20 px-4 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-10 bg-gray-800 rounded w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-800 rounded w-48 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-800 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Skeleton */}
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-10 bg-gray-800 rounded w-72 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-800 rounded w-48 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-800 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Divine </span>
            <span className="text-bronze">Sculptures</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Handcrafted spiritual art for your sacred spaces
          </p>
          <div className="space-x-4">
            <Link 
              to="/shop" 
              className="inline-block bg-bronze text-black px-8 py-3 rounded-lg font-semibold hover:bg-gold transition-colors"
            >
              Shop Now
            </Link>
            <Link 
              to="/about" 
              className="inline-block border border-bronze text-bronze px-8 py-3 rounded-lg font-semibold hover:bg-bronze hover:text-black transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Sacred Categories</h2>
            <p className="text-gray-400 text-lg">Explore our divine collection</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category._id} to={`/shop?category=${category._id}`} className="group">
                <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all group-hover:scale-105">
                  <div className="aspect-square relative overflow-hidden">
                    {category.image?.url ? (
                      <>
                        <img 
                          src={category.image.url} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center" style={{display: 'none'}}>
                          <div className="text-center p-4">
                            <div className="w-16 h-16 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-8 h-8 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                              </svg>
                            </div>
                            <div className="text-white font-semibold text-sm">{category.name}</div>
                            <div className="text-gray-400 text-xs mt-1">Sacred Category</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="w-16 h-16 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                            </svg>
                          </div>
                          <div className="text-white font-semibold text-sm">{category.name}</div>
                          <div className="text-gray-400 text-xs mt-1">Sacred Category</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg group-hover:text-bronze transition-colors">
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

      {/* Featured Products */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Sculptures</h2>
            <p className="text-gray-400 text-lg">Handpicked masterpieces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="group">
                <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group-hover:scale-105">
                  <div className="relative aspect-square overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <>
                        <img 
                          src={product.images[0].url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center" style={{display: 'none'}}>
                          <div className="text-center p-6">
                            <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-10 h-10 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <div className="text-white font-semibold text-lg">{product.name}</div>
                            <div className="text-gray-400 text-sm mt-2">Featured Sculpture</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-bronze" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <div className="text-white font-semibold text-lg">{product.name}</div>
                          <div className="text-gray-400 text-sm mt-2">Featured Sculpture</div>
                        </div>
                      </div>
                    )}
                    {product.discountPrice && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 group-hover:text-bronze transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-bronze font-bold text-lg">
                        ₹{(product.discountPrice || product.price)?.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              to="/shop" 
              className="inline-block bg-bronze text-black px-8 py-3 rounded-lg font-semibold hover:bg-gold transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-bronze/20 to-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Need Help Choosing?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Our AI assistant can help you find the perfect sculpture for your needs
          </p>
          <button className="bg-bronze text-black px-8 py-3 rounded-lg font-semibold hover:bg-gold transition-colors">
            Get Recommendations
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;