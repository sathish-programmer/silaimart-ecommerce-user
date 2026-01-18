import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  DocumentArrowDownIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    images: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const openReviewModal = async (product, orderId) => {
    try {
      // Check if user already has a review for this product
      const response = await axios.get(`${API_URL}/reviews/user/${product._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.review) {
        // Pre-fill form with existing review
        setReviewForm({
          rating: response.data.review.rating,
          comment: response.data.review.comment,
          images: response.data.review.images || []
        });
      } else {
        // Reset form for new review
        setReviewForm({ rating: 5, comment: '', images: [] });
      }
      
      setReviewProduct({ ...product, orderId, existingReview: response.data.review });
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error fetching user review:', error);
      setReviewProduct({ ...product, orderId });
      setReviewForm({ rating: 5, comment: '', images: [] });
      setShowReviewModal(true);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        productId: reviewProduct._id,
        orderId: reviewProduct.orderId,
        ...reviewForm
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.status === 201) {
        toast.success('Review submitted! It will be visible after admin approval.');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '', images: [] });
        setReviewProduct(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-900/20 text-blue-400 border-blue-500/30';
      case 'processing': return 'bg-purple-900/20 text-purple-400 border-purple-500/30';
      case 'shipped': return 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30';
      case 'delivered': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-900/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'processing': return <ClockIcon className="h-5 w-5" />;
      case 'shipped': return <TruckIcon className="h-5 w-5" />;
      case 'delivered': return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'razorpay': return <CreditCardIcon className="h-4 w-4" />;
      case 'stripe': return <CreditCardIcon className="h-4 w-4" />;
      case 'cod': return <BanknotesIcon className="h-4 w-4" />;
      case 'qr': return <QrCodeIcon className="h-4 w-4" />;
      default: return <CreditCardIcon className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-10 bg-gray-800 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-800 rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="h-6 bg-gray-800 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-800 rounded w-24 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex space-x-3">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-gray-400">Track and manage your sculpture orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-bronze focus:outline-none"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <TruckIcon className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-bronze text-black px-6 py-3 rounded-xl font-semibold hover:bg-gold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-bronze/50 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-bronze/20 rounded-xl flex items-center justify-center">
                      <span className="text-bronze font-bold text-lg">#{order.orderNumber?.slice(-4) || order._id.slice(-4)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Order #{order.orderNumber || order._id.slice(-8)}</h3>
                      <p className="text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      {order.estimatedDeliveryDate && (
                        <p className="text-bronze text-sm font-medium mt-1">
                          Expected Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {getPaymentIcon(order.paymentMethod)}
                        <span className="text-gray-400 text-sm capitalize">{order.paymentMethod}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 text-sm">{order.items?.length || 0} item(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-bronze mb-2">₹{order.total?.toLocaleString()}</p>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="font-medium capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex-shrink-0 flex items-center space-x-3 bg-gray-800 rounded-lg p-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img 
                              src={item.product.images[0].url} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${item.product?.images?.[0]?.url ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center p-1 text-center`}>
                            <span className="text-bronze font-bold text-[9px] leading-tight break-words">{item.product?.name || 'Product'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{item.product?.name || 'Product'}</p>
                          <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                          {order.orderStatus === 'delivered' && (
                            <button
                              onClick={() => openReviewModal(item.product, order._id)}
                              className="flex items-center space-x-1 text-bronze text-xs hover:text-gold transition-colors mt-1"
                            >
                              <StarIcon className="h-3 w-3" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="flex-shrink-0 bg-gray-800 rounded-lg p-3 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">+{order.items.length - 3} more</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Order Progress</span>
                    <span className="text-gray-400 text-sm">
                      {order.orderStatus === 'delivered' ? '100%' : 
                       order.orderStatus === 'shipped' ? '75%' :
                       order.orderStatus === 'processing' ? '50%' :
                       order.orderStatus === 'confirmed' ? '25%' : '10%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-bronze to-gold h-2 rounded-full transition-all duration-500"
                      style={{
                        width: order.orderStatus === 'delivered' ? '100%' : 
                               order.orderStatus === 'shipped' ? '75%' :
                               order.orderStatus === 'processing' ? '50%' :
                               order.orderStatus === 'confirmed' ? '25%' : '10%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => downloadInvoice(order._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>Download Invoice</span>
                      </button>
                    )}
                  </div>
                  {order.trackingNumber && (
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Tracking Number</p>
                      <p className="text-bronze font-mono">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h3>
                    <p className="text-gray-400">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-bronze">₹{selectedOrder.total?.toLocaleString()}</p>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.orderStatus)} mt-2`}>
                      {getStatusIcon(selectedOrder.orderStatus)}
                      <span className="font-medium capitalize">{selectedOrder.orderStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img 
                              src={item.product.images[0].url} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${item.product?.images?.[0]?.url ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center p-1 text-center`}>
                            <span className="text-bronze font-bold text-[10px] leading-tight break-words">{item.product?.name || 'Product'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{item.product?.name || 'Product'}</h5>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          {selectedOrder.orderStatus === 'delivered' && (
                            <button
                              onClick={() => openReviewModal(item.product, selectedOrder._id)}
                              className="flex items-center space-x-1 text-bronze text-sm hover:text-gold transition-colors mt-2"
                            >
                              <StarIcon className="h-4 w-4" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-bronze font-semibold">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                          {item.discountPrice && item.discountPrice < item.price && (
                            <p className="text-gray-500 text-sm line-through">₹{(item.price * item.quantity).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping:</span>
                      <span>{selectedOrder.shippingCost === 0 ? 'Free' : `₹${selectedOrder.shippingCost}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Tax (18% GST):</span>
                      <span>₹{selectedOrder.tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-bronze border-t border-gray-700 pt-2">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Shipping Address</h4>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-white font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-gray-300">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-gray-300">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p className="text-gray-300">{selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}</p>
                      <p className="text-gray-300">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Order Notes</h4>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-300">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
                  {selectedOrder.orderStatus === 'delivered' && (
                    <button
                      onClick={() => downloadInvoice(selectedOrder._id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      <span>Download Invoice</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Write a Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Product Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-800 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {reviewProduct.images?.[0]?.url ? (
                      <img 
                        src={reviewProduct.images[0].url} 
                        alt={reviewProduct.name} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${reviewProduct.images?.[0]?.url ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center p-1 text-center`}>
                      <span className="text-bronze font-bold text-[10px] leading-tight break-words">{reviewProduct.name}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{reviewProduct.name}</h3>
                    <p className="text-gray-400 text-sm">Share your experience with this product</p>
                  </div>
                </div>

                <form onSubmit={submitReview} className="space-y-4">
                  {reviewProduct.existingReview && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                      <p className="text-blue-400 text-sm">
                        You have already reviewed this product. You can update your review below.
                      </p>
                    </div>
                  )}
                  
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

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-bronze text-black rounded hover:bg-gold"
                    >
                      {reviewProduct.existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;