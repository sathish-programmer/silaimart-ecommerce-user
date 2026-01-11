import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { CreditCardIcon, QrCodeIcon, TruckIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', 
    phone: '', 
    email: '',
    street: '', 
    city: '', 
    state: '', 
    pincode: '', 
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Only redirect to cart if we're on step 1 and cart is empty
    if (items.length === 0 && currentStep === 1) {
      navigate('/cart');
      return;
    }
    fetchPaymentSettings();
    fetchAvailableCoupons();
    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, items, navigate, currentStep]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/public`);
      const settings = response.data.settings?.payment || {};
      console.log('Payment settings:', settings); // Debug log
      setPaymentSettings(settings);
      
      // Set default payment method based on enabled options
      if (settings.razorpay?.enabled) setPaymentMethod('razorpay');
      else if (settings.stripe?.enabled) setPaymentMethod('stripe');
      else if (settings.cod?.enabled) setPaymentMethod('cod');
      else if (settings.qr?.enabled) setPaymentMethod('qr');
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/public`);
      setAvailableCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code: couponCode.toUpperCase(),
        amount: getTotal()
      });

      const { coupon, discount: discountAmount } = response.data;
      setDiscount(discountAmount);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! ${coupon.type === 'percentage' ? coupon.value + '%' : '₹' + coupon.value} discount`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const calculateTotals = () => {
    const subtotal = getTotal();
    const shippingCost = subtotal >= 1000 ? 0 : 50;
    const taxAmount = Math.round((subtotal - discount) * 0.18);
    const total = subtotal - discount + shippingCost + taxAmount;
    
    return { subtotal, shippingCost, taxAmount, total };
  };

  const { subtotal, shippingCost, taxAmount, total } = calculateTotals();

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return items.length > 0;
      case 2:
        return formData.name.trim() && 
               formData.phone.trim() && 
               formData.street.trim() && 
               formData.city.trim() && 
               formData.state.trim() && 
               formData.pincode.trim();
      case 3:
        return paymentMethod !== '';
      case 4:
        return true; // Preview step doesn't need validation
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(5, prev + 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.street.trim()) {
      toast.error('Please enter your street address');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter your state');
      return;
    }
    if (!formData.pincode.trim()) {
      toast.error('Please enter your PIN code');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: formData,
        paymentMethod,
        couponCode: appliedCoupon?.code
      };

      const orderResponse = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const order = orderResponse.data.order;

      // Handle payment based on method
      if (paymentMethod === 'cod') {
        // Cash on Delivery - Order is placed successfully
        clearCart();
        navigate(`/order-success/${order._id}`);
      } else if (paymentMethod === 'qr') {
        // QR Code Payment - Generate QR and show
        await handleQRPayment(order);
      } else if (paymentMethod === 'razorpay') {
        // Initialize Razorpay payment
        await handleRazorpayPayment(order);
      } else if (paymentMethod === 'stripe') {
        // Initialize Stripe payment
        await handleStripePayment(order);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleQRPayment = async (order) => {
    try {
      const response = await axios.post(`${API_URL}/payments/qr/generate`, {
        amount: order.total,
        orderId: order._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setQrCodeData({ ...response.data, order });
      setShowQRCode(true);
      toast.success('QR Code generated! Please scan to pay.');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleRazorpayPayment = async (order) => {
    try {
      // Create Razorpay order
      const paymentResponse = await axios.post(`${API_URL}/payments/razorpay/create`, {
        amount: order.total,
        currency: 'INR'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const options = {
        key: paymentSettings.razorpay?.keyId,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'SilaiMart',
        description: 'Sculpture Purchase',
        order_id: paymentResponse.data.id,
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(`${API_URL}/payments/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            clearCart();
            navigate(`/order-success/${order._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#CD7F32'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Payment initialization failed');
    }
  };

  const handleStripePayment = async (order) => {
    try {
      const response = await axios.post(`${API_URL}/payments/stripe/create`, {
        amount: order.total,
        currency: 'inr'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Redirect to Stripe checkout or handle client-side
      toast.info('Redirecting to Stripe payment...');
      // Implementation depends on Stripe integration preference
    } catch (error) {
      toast.error('Payment initialization failed');
    }
  };

  if (showQRCode && qrCodeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCodeIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Scan QR Code to Pay</h2>
          <p className="text-gray-300 mb-6">
            Order #{qrCodeData.order?._id?.slice(-8)} - Amount: ₹{total.toLocaleString()}
          </p>
          
          <div className="bg-white p-4 rounded-xl mb-6">
            <img 
              src={qrCodeData.qrCode} 
              alt="Payment QR Code" 
              className="w-full max-w-xs mx-auto"
            />
          </div>
          
          <div className="text-left mb-6">
            <h3 className="text-white font-semibold mb-2">Instructions:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              {qrCodeData.instructions?.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-bronze mr-2">•</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                clearCart();
                navigate(`/order-success/${qrCodeData.order._id}`);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              I've Completed Payment
            </button>
            <button
              onClick={() => {
                setShowQRCode(false);
                toast.info('Payment cancelled. You can try again.');
              }}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remove the orderPlaced state check since we redirect to OrderSuccess page

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your divine sculpture purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, title: 'Cart Review', icon: '🛒' },
              { step: 2, title: 'Shipping', icon: '📍' },
              { step: 3, title: 'Payment', icon: '💳' },
              { step: 4, title: 'Preview', icon: '👁️' },
              { step: 5, title: 'Confirmation', icon: '✅' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  currentStep >= item.step 
                    ? 'bg-bronze border-bronze text-black' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= item.step ? 'text-bronze' : 'text-gray-400'
                  }`}>
                    {item.title}
                  </p>
                </div>
                {index < 4 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > item.step ? 'bg-bronze' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form className="space-y-8">
              {/* Step 1: Cart Review */}
              {currentStep === 1 && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{item.product.name}</h3>
                          <p className="text-gray-400 text-sm">{item.product.category?.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-bronze font-bold">
                              ₹{(item.product.discountPrice || item.product.price).toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-sm">× {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Coupon Section */}
                  <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Apply Coupon</h3>
                      <button
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="text-bronze text-sm hover:text-gold transition-colors"
                      >
                        {showCoupons ? 'Hide' : 'Show'} Available Coupons
                      </button>
                    </div>
                    
                    {showCoupons && (
                      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                        <h4 className="text-white text-sm font-medium mb-2">Available Coupons:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableCoupons.filter(coupon => {
                            const now = new Date();
                            const validFrom = new Date(coupon.validFrom);
                            const validUntil = new Date(coupon.validUntil);
                            return coupon.isActive && now >= validFrom && now <= validUntil && getTotal() >= (coupon.minimumAmount || 0);
                          }).map((coupon) => (
                            <div key={coupon._id} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                              <div>
                                <span className="text-bronze font-mono text-sm">{coupon.code}</span>
                                <p className="text-gray-300 text-xs">
                                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                                  {coupon.minimumAmount && ` on orders above ₹${coupon.minimumAmount}`}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                  setShowCoupons(false);
                                }}
                                className="text-xs bg-bronze text-black px-2 py-1 rounded hover:bg-gold"
                              >
                                Use
                              </button>
                            </div>
                          ))}
                          {availableCoupons.filter(coupon => {
                            const now = new Date();
                            const validFrom = new Date(coupon.validFrom);
                            const validUntil = new Date(coupon.validUntil);
                            return coupon.isActive && now >= validFrom && now <= validUntil && getTotal() >= (coupon.minimumAmount || 0);
                          }).length === 0 && (
                            <p className="text-gray-400 text-sm">No coupons available for your cart</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!appliedCoupon ? (
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-bronze focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="px-6 py-2 bg-bronze text-black rounded-lg font-semibold hover:bg-gold transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div>
                          <span className="text-green-400 font-semibold">{appliedCoupon.code}</span>
                          <p className="text-green-300 text-sm">
                            {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>
                    Shipping Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.name.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.phone.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Street Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.street.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.city.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.state.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PIN Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all ${
                          !formData.pincode.trim() ? 'border-red-500' : 'border-gray-700'
                        }`}
                        placeholder="Enter your PIN code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 transition-all"
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>
                    Payment Method
                  </h2>
                  
                  {!paymentMethod && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">Please select a payment method to continue</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {Object.keys(paymentSettings).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Loading payment methods...</p>
                      </div>
                    ) : (
                      <>
                    {paymentSettings.razorpay?.enabled && (
                      <label className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'razorpay' 
                          ? 'border-bronze bg-bronze/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-bronze focus:ring-bronze"
                        />
                        <div className="ml-4 flex items-center">
                          <CreditCardIcon className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <span className="text-white font-semibold text-lg">Razorpay</span>
                            <p className="text-gray-400 text-sm">Pay securely with cards, UPI, wallets & more</p>
                          </div>
                        </div>
                      </label>
                    )}
                    
                    {paymentSettings.stripe?.enabled && (
                      <label className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'stripe' 
                          ? 'border-bronze bg-bronze/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-bronze focus:ring-bronze"
                        />
                        <div className="ml-4 flex items-center">
                          <CreditCardIcon className="h-8 w-8 text-purple-500 mr-3" />
                          <div>
                            <span className="text-white font-semibold text-lg">Stripe</span>
                            <p className="text-gray-400 text-sm">International payments with credit/debit cards</p>
                          </div>
                        </div>
                      </label>
                    )}
                    
                    {paymentSettings.cod?.enabled && (
                      <label className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'cod' 
                          ? 'border-bronze bg-bronze/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-bronze focus:ring-bronze"
                        />
                        <div className="ml-4 flex items-center">
                          <TruckIcon className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <span className="text-white font-semibold text-lg">Cash on Delivery</span>
                            <p className="text-gray-400 text-sm">
                              Pay when you receive your order
                              {paymentSettings.cod?.maximumAmount && (
                                <span className="block text-xs text-orange-400">
                                  Available for orders up to ₹{paymentSettings.cod.maximumAmount.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                    
                    {paymentSettings.qr?.enabled && (
                      <label className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'qr' 
                          ? 'border-bronze bg-bronze/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="qr"
                          checked={paymentMethod === 'qr'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-bronze focus:ring-bronze"
                        />
                        <div className="ml-4 flex items-center">
                          <QrCodeIcon className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <span className="text-white font-semibold text-lg">QR Code Payment</span>
                            <p className="text-gray-400 text-sm">Pay using UPI QR code</p>
                          </div>
                        </div>
                      </label>
                    )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Order Preview */}
              {currentStep === 4 && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>
                    Review Your Order
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Items ({items.length})</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.product._id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                            <img
                              src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{item.product.name}</p>
                              <p className="text-gray-400 text-xs">₹{(item.product.discountPrice || item.product.price).toLocaleString()} × {item.quantity}</p>
                            </div>
                            <p className="text-bronze font-semibold text-sm">
                              ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Shipping & Payment Details */}
                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                        <div className="bg-gray-800 rounded-lg p-4">
                          <p className="text-white font-medium">{formData.name}</p>
                          <p className="text-gray-300 text-sm">{formData.phone}</p>
                          {formData.email && <p className="text-gray-300 text-sm">{formData.email}</p>}
                          <div className="mt-2 text-gray-300 text-sm">
                            <p>{formData.street}</p>
                            <p>{formData.city}, {formData.state} {formData.pincode}</p>
                            <p>{formData.country}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Method */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Payment Method</h3>
                        <div className="bg-gray-800 rounded-lg p-4">
                          <p className="text-white font-medium">
                            {paymentMethod === 'razorpay' && 'Razorpay'}
                            {paymentMethod === 'stripe' && 'Stripe'}
                            {paymentMethod === 'cod' && 'Cash on Delivery'}
                            {paymentMethod === 'qr' && 'QR Code Payment'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {paymentMethod === 'razorpay' && 'Pay securely with cards, UPI, wallets & more'}
                            {paymentMethod === 'stripe' && 'International payments with credit/debit cards'}
                            {paymentMethod === 'cod' && 'Pay when you receive your order'}
                            {paymentMethod === 'qr' && 'Pay using UPI QR code'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-gray-300">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-green-400">
                              <span>Discount ({appliedCoupon?.code})</span>
                              <span>-₹{discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-300">
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Tax (18% GST)</span>
                            <span>₹{taxAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-2">
                            <span>Total</span>
                            <span className="text-bronze">₹{total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Please review all details carefully before confirming your order.
                    </p>
                  </div>
                </div>
              )}
            </form>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-bronze text-black rounded-xl font-semibold hover:bg-gold transition-colors"
                >
                  {currentStep === 3 ? 'Review Order' : 'Next'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-bronze to-gold text-black rounded-xl font-bold hover:from-gold hover:to-bronze transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span>Confirm Order - ₹{total.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sticky top-24 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-bronze rounded-full mr-3"></span>
                Order Summary
              </h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-bronze font-semibold text-sm">
                      ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Tax (18% GST)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-3">
                  <span>Total</span>
                  <span className="text-bronze">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-green-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <TruckIcon className="h-4 w-4" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;