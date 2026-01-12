import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  MapPinIcon, 
  CreditCardIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'razorpay': return 'Razorpay';
      case 'stripe': return 'Stripe';
      case 'cod': return 'Cash on Delivery';
      case 'qr': return 'QR Code Payment';
      default: return method;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'processing': return 'text-purple-400';
      case 'shipped': return 'text-indigo-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="bg-bronze text-black px-6 py-3 rounded-xl font-semibold hover:bg-gold transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className={`flex items-center space-x-1 ${getStatusColor(order.orderStatus)}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="capitalize font-medium">{order.orderStatus}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-3xl font-bold text-bronze">₹{order.total.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Amount</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Items Ordered ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl">
                  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product?.name || 'Product'}
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
                    <h4 className="text-white font-semibold">{item.product?.name || 'Product'}</h4>
                    <p className="text-gray-400 text-sm">{item.product?.category?.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-bronze font-bold">
                        ₹{(item.product?.discountPrice || item.product?.price || 0).toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm">× {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      ₹{((item.product?.discountPrice || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Shipping Address */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </h3>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-white font-semibold">{order.shippingAddress.name}</p>
                <p className="text-gray-300">{order.shippingAddress.phone}</p>
                {order.shippingAddress.email && (
                  <p className="text-gray-300">{order.shippingAddress.email}</p>
                )}
                <div className="mt-2 text-gray-300">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300">Payment Method</span>
                  <span className="text-white font-semibold">
                    {getPaymentMethodDisplay(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300">Payment Status</span>
                  <span className={`font-semibold capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-400' : 
                    order.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Transaction ID</span>
                    <span className="text-white font-mono text-sm">
                      {order.paymentId.slice(-12)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Tax (18% GST)</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-3">
                <span>Total</span>
                <span className="text-bronze">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="flex items-center justify-center space-x-2 bg-bronze text-black px-8 py-3 rounded-xl font-semibold hover:bg-gold transition-colors"
          >
            <TruckIcon className="h-5 w-5" />
            <span>Track Order</span>
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center space-x-2 bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>View All Orders</span>
          </button>
          
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-2">
            You will receive an order confirmation email shortly.
          </p>
          <p className="text-gray-400">
            For any queries, contact us at{' '}
            <a href="mailto:silaimartindia@gmail.com" className="text-bronze hover:text-gold">
              silaimartindia@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;