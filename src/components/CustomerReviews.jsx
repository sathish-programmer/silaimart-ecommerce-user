import { useState, useEffect } from 'react';
import { StarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CustomerReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    orderId: '',
    rating: 5,
    comment: '',
    images: []
  });
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserOrders();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter orders that contain this product and are delivered
      const eligibleOrders = data.orders.filter(order => 
        order.orderStatus === 'delivered' && 
        order.items.some(item => item.product._id === productId)
      );
      
      setUserOrders(eligibleOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setReviewForm(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          ...reviewForm
        })
      });

      if (response.ok) {
        toast.success('Review submitted! It will be visible after admin approval.');
        setShowReviewForm(false);
        setReviewForm({
          orderId: '',
          rating: 5,
          comment: '',
          images: []
        });
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => onRate(i + 1) : undefined}
        className={interactive ? 'hover:scale-110 transition-transform' : ''}
        disabled={!interactive}
      >
        {i < rating ? 
          <StarSolid className="h-5 w-5 text-yellow-400" /> :
          <StarIcon className="h-5 w-5 text-gray-300" />
        }
      </button>
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats || !stats.ratingDistribution) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-gray-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-bronze mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-gray-400">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {user && userOrders.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-bronze text-black px-6 py-2 rounded-lg hover:bg-gold transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
              
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Select Order</label>
                  <select
                    value={reviewForm.orderId}
                    onChange={(e) => setReviewForm({...reviewForm, orderId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  >
                    <option value="">Select an order</option>
                    {userOrders.map(order => (
                      <option key={order._id} value={order._id}>
                        Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm({...reviewForm, rating})
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows="4"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Images (Optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                  {reviewForm.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {reviewForm.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-bronze text-black rounded hover:bg-gold"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">{review.user.name}</span>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-3">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              
              {review.adminResponse && (
                <div className="bg-gray-800 p-3 rounded mt-3">
                  <div className="text-bronze text-sm font-semibold mb-1">SilaiMart Response:</div>
                  <p className="text-gray-300 text-sm">{review.adminResponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerReviews;