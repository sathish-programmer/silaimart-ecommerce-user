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
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data.order || response.data);
    } catch (error) {
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

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-violet-50 text-violet-700 border-violet-200',
      shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button onClick={() => navigate('/orders')}
            className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 pt-24">
      <div className="max-w-4xl mx-auto px-4">

        {/* Success Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-green-50">
            <CheckCircleIcon className="h-11 w-11 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">

          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 border-b border-gray-100 bg-stone-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-3xl font-bold text-violet-600">₹{order.total.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-0.5">Total Amount</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Order Items */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5 text-violet-500" />
                Items Ordered ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-gray-100">
                    <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-violet-600 font-bold text-[9px] text-center px-1">{item.product?.name || 'Product'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold text-sm">{item.product?.name || 'Product'}</h4>
                      <p className="text-gray-400 text-xs">{item.product?.category?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-violet-600 font-bold text-sm">
                          ₹{(item.product?.discountPrice || item.product?.price || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs">× {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-gray-900 font-bold">
                      ₹{((item.product?.discountPrice || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-violet-500" />
                  Shipping Address
                </h3>
                <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 space-y-0.5">
                  <p className="text-gray-900 font-semibold">{order.shippingAddress.name}</p>
                  <p className="text-gray-500 text-sm">{order.shippingAddress.phone}</p>
                  {order.shippingAddress.email && <p className="text-gray-500 text-sm">{order.shippingAddress.email}</p>}
                  <div className="pt-1 text-gray-500 text-sm space-y-0.5">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-violet-500" />
                  Payment Information
                </h3>
                <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Payment Method</span>
                    <span className="text-gray-900 font-semibold text-sm">{getPaymentMethodDisplay(order.paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Payment Status</span>
                    <span className={`font-semibold capitalize text-sm ${order.paymentStatus === 'paid' ? 'text-green-600' :
                        order.paymentStatus === 'pending' ? 'text-amber-600' : 'text-red-600'
                      }`}>{order.paymentStatus}</span>
                  </div>
                  {order.paymentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Transaction ID</span>
                      <span className="text-gray-900 font-mono text-xs">{order.paymentId.slice(-12)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-stone-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (18% GST)</span><span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3 text-base">
                  <span>Total</span>
                  <span className="text-violet-600">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(`/orders/${order._id}`)}
            className="flex items-center justify-center gap-2 bg-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-sm">
            <TruckIcon className="h-5 w-5" />
            Track Order
          </button>
          <button onClick={() => navigate('/orders')}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            <DocumentArrowDownIcon className="h-5 w-5" />
            View All Orders
          </button>
          <button onClick={() => navigate('/shop')}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            <ShoppingBagIcon className="h-5 w-5" />
            Continue Shopping
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-1">You will receive an order confirmation email shortly.</p>
          <p className="text-gray-400 text-sm">
            For any queries, contact us at{' '}
            <a href="mailto:silaimartindia@gmail.com" className="text-violet-600 hover:text-violet-700">
              silaimartindia@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;