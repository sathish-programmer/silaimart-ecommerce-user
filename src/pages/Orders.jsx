import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon, DocumentArrowDownIcon, TruckIcon, CheckCircleIcon,
  ClockIcon, XCircleIcon, CreditCardIcon, BanknotesIcon, QrCodeIcon,
  StarIcon, MagnifyingGlassIcon, ChevronDownIcon
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
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', images: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.orders || []);
    } catch { toast.error('Failed to fetch orders'); }
    finally { setLoading(false); }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const orderData = response.data.order || response.data;
      if (!orderData?._id) { toast.error('Order data is incomplete'); return; }
      setSelectedOrder(orderData);
      setShowModal(true);
    } catch { toast.error('Failed to fetch order details'); }
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
      link.href = url; link.download = `invoice-${orderId?.slice(-8) || 'order'}.pdf`;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded!');
    } catch { toast.error('Failed to download invoice'); }
  };

  const openReviewModal = async (product, orderId) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/user/${product._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.review) {
        setReviewForm({ rating: response.data.review.rating, comment: response.data.review.comment, images: response.data.review.images || [] });
      } else { setReviewForm({ rating: 5, comment: '', images: [] }); }
      setReviewProduct({ ...product, orderId, existingReview: response.data.review });
      setShowReviewModal(true);
    } catch {
      setReviewProduct({ ...product, orderId });
      setReviewForm({ rating: 5, comment: '', images: [] });
      setShowReviewModal(true);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/reviews`, {
        productId: reviewProduct._id, orderId: reviewProduct.orderId, ...reviewForm
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (response.status === 201) {
        toast.success('Review submitted! Visible after admin approval.');
        setShowReviewModal(false); setReviewForm({ rating: 5, comment: '', images: [] }); setReviewProduct(null);
      }
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to submit review'); }
  };

  const renderStars = (rating, interactive = false, onRate = null) =>
    [...Array(5)].map((_, i) => (
      <button key={i} type={interactive ? 'button' : undefined}
        onClick={interactive ? () => onRate(i + 1) : undefined}
        className={interactive ? 'hover:scale-110 transition-transform' : ''} disabled={!interactive}>
        {i < rating ? <StarSolid className="h-5 w-5 text-amber-400" /> : <StarIcon className="h-5 w-5 text-gray-200" />}
      </button>
    ));

  const getStatusConfig = (status) => {
    const map = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
      processing: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
      shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
      delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-400' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
    };
    return map[status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-300' };
  };

  const getStatusIcon = (status) => {
    const map = { pending: ClockIcon, confirmed: CheckCircleIcon, processing: ClockIcon, shipped: TruckIcon, delivered: CheckCircleIcon, cancelled: XCircleIcon };
    const Icon = map[status] || ClockIcon;
    return <Icon className="h-4 w-4" />;
  };

  const getPaymentIcon = (method) => {
    if (method === 'cod') return <BanknotesIcon className="h-4 w-4" />;
    if (method === 'qr') return <QrCodeIcon className="h-4 w-4" />;
    return <CreditCardIcon className="h-4 w-4" />;
  };

  const getProgress = (status) => {
    const map = { pending: 10, confirmed: 25, processing: 50, shipped: 75, delivered: 100, cancelled: 0 };
    return map[status] || 0;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesSearch = searchTerm === '' ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 bg-gray-100 rounded w-32" /> <div className="h-7 bg-gray-100 rounded w-24" />
              </div>
              <div className="flex gap-4">
                {[...Array(3)].map((_, j) => <div key={j} className="w-16 h-16 bg-gray-100 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none w-full sm:w-56" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none w-full sm:w-auto">
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDownIcon className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="h-8 w-8 text-violet-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <button onClick={() => navigate('/shop')}
              className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-md transition-all">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const sc = getStatusConfig(order.orderStatus);
              const progress = getProgress(order.orderStatus);
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-600 font-bold text-sm">#{order.orderNumber?.slice(-4) || order._id?.slice(-4) || '????'}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Order #{order.orderNumber || order._id?.slice(-8) || 'Unknown'}</h3>
                          <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getPaymentIcon(order.paymentMethod)}
                            <span className="text-gray-400 text-xs capitalize">{order.paymentMethod}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 text-xs">{order.items?.length || 0} item(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <p className="text-2xl font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {order.items?.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-stone-50 rounded-xl p-3 min-w-0">
                          <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.product?.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <span className="text-violet-400 font-bold text-[8px] text-center leading-tight px-1">{item.product?.name?.slice(0, 6) || 'Item'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 text-xs font-medium truncate max-w-[80px]">{item.product?.name || 'Product'}</p>
                            <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                            {order.orderStatus === 'delivered' && (
                              <button onClick={() => openReviewModal(item.product, order._id)}
                                className="flex items-center gap-0.5 text-violet-600 text-xs hover:text-violet-700 mt-0.5 font-medium">
                                <StarIcon className="h-3 w-3" />Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex-shrink-0 bg-stone-50 rounded-xl p-3 flex items-center">
                          <span className="text-gray-400 text-xs">+{order.items.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  {order.orderStatus !== 'cancelled' && (
                    <div className="px-6 pb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 pb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-50 pt-4">
                    <div className="flex gap-2">
                      <button onClick={() => viewOrderDetails(order._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 rounded-xl text-sm font-medium transition-colors">
                        <EyeIcon className="h-4 w-4" /> View Details
                      </button>
                      {order.orderStatus === 'delivered' && (
                        <button onClick={() => downloadInvoice(order._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors">
                          <DocumentArrowDownIcon className="h-4 w-4" /> Invoice
                        </button>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-left sm:text-right">
                        <p className="text-gray-400 text-xs">Tracking</p>
                        <p className="text-violet-600 font-mono text-sm">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-gray-900">Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}</h3>
                    <p className="text-gray-500 text-sm">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Date unavailable'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{selectedOrder.total?.toLocaleString() || '0'}</p>
                    {(() => {
                      const sc = getStatusConfig(selectedOrder.orderStatus); return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mt-1 ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selectedOrder.orderStatus}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                        <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0]?.url ? (
                            <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                          ) : <span className="text-violet-400 text-xs font-bold">{item.product?.name?.slice(0, 5)}</span>}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h5>
                          <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                          {selectedOrder.orderStatus === 'delivered' && (
                            <button onClick={() => openReviewModal(item.product, selectedOrder._id)}
                              className="flex items-center gap-1 text-violet-600 text-sm hover:text-violet-700 mt-1 font-medium">
                              <StarIcon className="h-4 w-4" />Write Review
                            </button>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-bold">₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                          {item.discountPrice && item.discountPrice < item.price && (
                            <p className="text-gray-400 text-sm line-through">₹{(item.price * item.quantity).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-stone-50 rounded-2xl p-5">
                  <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString() || '0'}</span></div>
                    {(selectedOrder.discount || 0) > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{selectedOrder.discount?.toLocaleString() || '0'}</span></div>}
                    {(selectedOrder.loyaltyDiscount || 0) > 0 && <div className="flex justify-between text-blue-600"><span>Loyalty Points ({selectedOrder.loyaltyPointsUsed || 0} pts)</span><span>-₹{selectedOrder.loyaltyDiscount?.toLocaleString() || '0'}</span></div>}
                    <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{(selectedOrder.shippingCost || 0) === 0 ? 'Free' : `₹${selectedOrder.shippingCost}`}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Tax (GST)</span><span>₹{selectedOrder.tax?.toLocaleString() || '0'}</span></div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
                      <span>Total</span><span>₹{selectedOrder.total?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                    <div className="bg-stone-50 rounded-2xl p-4 text-sm space-y-1">
                      <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}</p>
                      <p className="text-gray-600">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  {selectedOrder.orderStatus === 'delivered' && (
                    <button onClick={() => downloadInvoice(selectedOrder._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors">
                      <DocumentArrowDownIcon className="h-4 w-4" />Download Invoice
                    </button>
                  )}
                  <button onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewProduct && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl mb-5">
                  <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {reviewProduct.images?.[0]?.url ? (
                      <img src={reviewProduct.images[0].url} alt={reviewProduct.name} className="w-full h-full object-cover rounded-xl" />
                    ) : <span className="text-violet-400 text-xs font-bold">{reviewProduct.name?.slice(0, 5)}</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{reviewProduct.name}</h3>
                    <p className="text-gray-500 text-sm">Share your experience</p>
                  </div>
                </div>

                {reviewProduct.existingReview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-blue-700 text-sm">
                    You've already reviewed this product. You can update your review below.
                  </div>
                )}

                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">{renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none resize-none"
                      rows="4" placeholder="Share your experience..." required />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">Cancel</button>
                    <button type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl hover:shadow-md text-sm font-medium transition-all">
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