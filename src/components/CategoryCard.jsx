import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/shop?category=${category._id}`}>
        <div className="bg-white rounded-lg overflow-hidden hover:bg-gray-50 transition-all duration-300 group-hover:scale-105">
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={category.image?.url || '/placeholder-category.jpg'} 
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-semibold text-lg group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;