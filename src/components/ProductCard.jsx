import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart!');
  };

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className=\"group\"
    >
      <Link to={`/product/${product._id}`} className=\"block\">
        <div className=\"bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105\">
          {/* Image */}
          <div className=\"relative aspect-square overflow-hidden\">
            <img 
              src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
              alt={product.name}
              className=\"w-full h-full object-cover group-hover:scale-110 transition-transform duration-300\"
            />
            {discountPercentage > 0 && (
              <div className=\"absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold\">
                -{discountPercentage}%
              </div>
            )}
            {product.stock === 0 && (
              <div className=\"absolute inset-0 bg-black/50 flex items-center justify-center\">
                <span className=\"text-white font-semibold\">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className=\"p-4\">
            <h3 className=\"text-white font-semibold mb-2 line-clamp-2 group-hover:text-bronze transition-colors\">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating?.average > 0 && (
              <div className=\"flex items-center mb-2\">
                <div className=\"flex items-center\">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating.average) 
                          ? 'text-yellow-400' 
                          : 'text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <span className=\"text-gray-400 text-sm ml-2\">
                  ({product.rating.count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className=\"flex items-center justify-between mb-3\">
              <div className=\"flex items-center space-x-2\">
                <span className=\"text-bronze font-bold text-lg\">
                  ₹{product.discountPrice || product.price}
                </span>
                {product.discountPrice && (
                  <span className=\"text-gray-500 line-through text-sm\">
                    ₹{product.price}
                  </span>
                )}\n              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className=\"w-full bg-bronze text-black py-2 rounded-lg font-semibold hover:bg-gold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2\"
            >
              <ShoppingCartIcon className=\"h-4 w-4\" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;