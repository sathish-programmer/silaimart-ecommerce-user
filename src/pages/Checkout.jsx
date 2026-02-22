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
  const [appSettings, setAppSettings] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Save current location to return after login
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }
    // Only redirect to cart if we're on step 1 and cart is empty
    if (items.length === 0 && currentStep === 1) {
      navigate('/cart');
      return;
    }
    fetchAppSettings();
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

  const fetchAppSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/public`);
      const settings = response.data.settings || {};
      console.log('App settings:', settings); // Debug log
      setAppSettings(settings);

      // Set default payment method only if no method is selected yet
      if (!paymentMethod) {
        if (settings.payment?.razorpay?.enabled) setPaymentMethod('razorpay');
        else if (settings.payment?.stripe?.enabled) setPaymentMethod('stripe');
        else if (settings.payment?.cod?.enabled) setPaymentMethod('cod');
        else if (settings.payment?.qr?.enabled) setPaymentMethod('qr');
      }
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
    const freeShippingThreshold = appSettings.shipping?.freeShippingThreshold || 1000;
    const standardShippingCost = appSettings.shipping?.standardShipping || 50;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;

    const taxRate = appSettings.tax?.rate || 18;
    const taxEnabled = appSettings.tax?.enabled || true;
    const totalDiscount = discount + loyaltyDiscount;
    const taxAmount = taxEnabled ? Math.round((subtotal - totalDiscount) * (taxRate / 100)) : 0;

    const total = Math.max(0, subtotal - totalDiscount + shippingCost + taxAmount);

    return { subtotal, shippingCost, taxAmount, total, taxRate, totalDiscount };
  };

  const { subtotal, shippingCost, taxAmount, total, taxRate, totalDiscount } = calculateTotals();

  const handleLoyaltyPointsToggle = (checked) => {
    setUseLoyaltyPoints(checked);
    if (checked && user?.loyaltyPoints > 0) {
      const maxPoints = Math.min(user.loyaltyPoints, Math.floor(subtotal - discount));
      setLoyaltyPointsToUse(maxPoints);
      setLoyaltyDiscount(maxPoints);
    } else {
      setLoyaltyPointsToUse(0);
      setLoyaltyDiscount(0);
    }
  };

  const handleLoyaltyPointsChange = (points) => {
    const maxPoints = Math.min(user?.loyaltyPoints || 0, Math.floor(subtotal - discount));
    const validPoints = Math.max(0, Math.min(points, maxPoints));
    setLoyaltyPointsToUse(validPoints);
    setLoyaltyDiscount(validPoints);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return items.length > 0;
      case 2:
        return formData.name.trim() &&
          formData.phone.trim() &&
          formData.email.trim() &&
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

  const handleQRCodeGeneration = async () => {
    try {
      setLoading(true);
      // Calculate totals for QR code
      const { total } = calculateTotals();

      // Generate QR code with temporary order data (order will be created in step 4)
      const response = await axios.post(`${API_URL}/payments/qr/generate`, {
        amount: total,
        orderId: 'preview' // Temporary ID for preview
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data && response.data.qrCode) {
        setQrCodeData({
          ...response.data,
          previewAmount: total,
          isPreview: true
        });
        setShowQRCode(true);
      } else {
        toast.error('Invalid QR code response from server');
      }
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      // If on step 3 and QR payment is selected, generate and show QR code first
      if (currentStep === 3 && paymentMethod === 'qr') {
        await handleQRCodeGeneration();
        return; // Don't proceed to next step yet
      }
      setCurrentStep(prev => Math.min(5, prev + 1));
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    // Scroll to top when going to previous step
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
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
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code,
        loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0
      };

      console.log('Creating order with payment method:', paymentMethod); // Debug log
      console.log('Order data:', orderData); // Debug log

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
        // QR Code Payment - User already saw QR code before review, just go to success page
        clearCart();
        navigate(`/order-success/${order._id}`);
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

      if (response.data && response.data.qrCode) {
        setQrCodeData({ ...response.data, order, isPreview: false });
        setShowQRCode(true);
        toast.success('QR Code generated! Please scan to pay.');
      } else {
        toast.error('Invalid QR code response from server');
      }
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
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
        key: appSettings.payment?.razorpay?.keyId,
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
    if (qrCodeData.isPreview) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center py-8 pt-24">
          <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCodeIcon className="h-11 w-11 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Scan QR Code to Pay</h2>
            <p className="text-gray-500 mb-6">Amount: ₹{qrCodeData.previewAmount?.toLocaleString() || total.toLocaleString()}</p>
            <div className="bg-stone-50 p-4 rounded-xl mb-6 border border-gray-100">
              <img src={qrCodeData.qrCode} alt="Payment QR Code" className="w-full max-w-xs mx-auto" />
            </div>
            <div className="text-left mb-6">
              <h3 className="text-gray-900 font-semibold mb-2">Instructions:</h3>
              <ul className="text-gray-500 text-sm space-y-1">
                {qrCodeData.instructions?.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">•</span>{instruction}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setShowQRCode(false); setQrCodeData(null); setCurrentStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
                Continue to Review
              </button>
              <button onClick={() => { setShowQRCode(false); setQrCodeData(null); }}
                className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If order is created, show completion button
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center pt-24 pb-12">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCodeIcon className="h-11 w-11 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Scan QR Code to Pay</h2>
          <p className="text-gray-500 mb-6">Order #{qrCodeData.order?.orderNumber || qrCodeData.order?._id?.slice(-8)} · ₹{qrCodeData.order?.total?.toLocaleString() || total.toLocaleString()}</p>
          <div className="bg-stone-50 p-4 rounded-xl mb-6 border border-gray-100">
            <img src={qrCodeData.qrCode} alt="Payment QR Code" className="w-full max-w-xs mx-auto" />
          </div>
          <div className="text-left mb-6">
            <h3 className="text-gray-900 font-semibold mb-2">Instructions:</h3>
            <ul className="text-gray-500 text-sm space-y-1">
              {qrCodeData.instructions?.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span>{instruction}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <button onClick={() => { clearCart(); navigate(`/order-success/${qrCodeData.order._id}`); }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              I've Completed Payment
            </button>
            <button onClick={() => { setShowQRCode(false); toast.info('Payment cancelled. You can try again.'); }}
              className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remove the orderPlaced state check since we redirect to OrderSuccess page

  return (
    <div className="min-h-screen bg-stone-50 py-8 pt-[11.5rem]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-gray-500">Complete your divine sculpture purchase</p>
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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= item.step
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-gray-300 text-gray-400 bg-white'
                  }`}>
                  <span className="text-base">{item.icon}</span>
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-xs font-medium ${currentStep >= item.step ? 'text-violet-600' : 'text-gray-400'
                    }`}>{item.title}</p>
                </div>
                {index < 4 && (
                  <div className={`w-10 h-0.5 mx-3 ${currentStep > item.step ? 'bg-violet-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <form className="space-y-8">
                {/* Step 1: Cart Review */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Review Your Order
                    </h2>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product._id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-gray-100">
                          <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                            {item.product.images?.[0]?.url ? (
                              <img src={item.product.images[0].url} alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div className="hidden w-full h-full flex-col items-center justify-center p-1 text-center">
                              <span className="text-violet-600 font-bold text-[10px] leading-tight break-words">{item.product.name}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-semibold">{item.product.name}</h3>
                            <p className="text-gray-400 text-sm">{item.product.category?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-violet-600 font-bold">₹{(item.product.discountPrice || item.product.price).toLocaleString()}</span>
                              <span className="text-gray-400 text-sm">× {item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-gray-900 font-bold">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Section */}
                    <div className="mt-5 p-4 bg-stone-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-900 font-semibold">Apply Coupon</h3>
                        <button type="button" onClick={(e) => { e.preventDefault(); setShowCoupons(!showCoupons); }}
                          className="text-violet-600 text-sm hover:text-violet-700 transition-colors">
                          {showCoupons ? 'Hide' : 'Show'} Coupons
                        </button>
                      </div>
                      {showCoupons && (
                        <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100">
                          <h4 className="text-gray-700 text-sm font-medium mb-2">Available Coupons:</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {availableCoupons.filter(coupon => {
                              const now = new Date(); const validFrom = new Date(coupon.validFrom); const validUntil = new Date(coupon.validUntil);
                              return coupon.isActive && now >= validFrom && now <= validUntil && getTotal() >= (coupon.minimumAmount || 0);
                            }).map((coupon) => (
                              <div key={coupon._id} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-gray-100">
                                <div>
                                  <span className="text-violet-600 font-mono text-sm">{coupon.code}</span>
                                  <p className="text-gray-500 text-xs">{coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}{coupon.minimumAmount && ` on orders above ₹${coupon.minimumAmount}`}</p>
                                </div>
                                <button onClick={() => { setCouponCode(coupon.code); setShowCoupons(false); }}
                                  className="text-xs bg-violet-600 text-white px-2 py-1 rounded-lg hover:bg-violet-700">Use</button>
                              </div>
                            ))}
                            {availableCoupons.filter(coupon => { const now = new Date(); return coupon.isActive && now >= new Date(coupon.validFrom) && now <= new Date(coupon.validUntil) && getTotal() >= (coupon.minimumAmount || 0); }).length === 0 && (
                              <p className="text-gray-400 text-sm">No coupons available for your cart</p>
                            )}
                          </div>
                        </div>
                      )}
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Enter coupon code" value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none" />
                          <button type="button" onClick={applyCoupon}
                            className="px-5 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">Apply</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                          <div>
                            <span className="text-green-700 font-semibold">{appliedCoupon.code}</span>
                            <p className="text-green-600 text-sm">{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`}</p>
                          </div>
                          <button type="button" onClick={removeCoupon} className="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
                        </div>
                      )}
                    </div>

                    {user?.loyaltyPoints > 0 && (
                      <div className="mt-5 p-4 bg-stone-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-900 font-semibold">Use Loyalty Points</h3>
                          <div className="text-violet-600 text-sm font-medium">{user.loyaltyPoints} pts available</div>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <input type="checkbox" id="useLoyaltyPoints" checked={useLoyaltyPoints}
                            onChange={(e) => handleLoyaltyPointsToggle(e.target.checked)}
                            className="accent-violet-600" />
                          <label htmlFor="useLoyaltyPoints" className="text-gray-700 text-sm">Use loyalty points (1 point = ₹1 discount)</label>
                        </div>
                        {useLoyaltyPoints && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input type="number" value={loyaltyPointsToUse}
                                onChange={(e) => handleLoyaltyPointsChange(Number(e.target.value))}
                                min="0" max={Math.min(user.loyaltyPoints, Math.floor(subtotal - discount))}
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
                                placeholder="Points to use" />
                              <button type="button" onClick={() => handleLoyaltyPointsChange(Math.min(user.loyaltyPoints, Math.floor(subtotal - discount)))}
                                className="px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm">Use Max</button>
                            </div>
                            {loyaltyDiscount > 0 && (
                              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <div>
                                  <span className="text-blue-700 font-semibold">{loyaltyPointsToUse} points selected</span>
                                  <p className="text-blue-600 text-sm">₹{loyaltyDiscount} discount will be applied</p>
                                </div>
                                <button type="button" onClick={() => handleLoyaltyPointsToggle(false)} className="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Shipping Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.name.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.phone.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your phone number" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.street.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your street address" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">City <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.city.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your city" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">State <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.state.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your state" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">PIN Code <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all ${!formData.pincode.trim() ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="Enter your PIN code" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Country</label>
                        <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-gray-200 rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all">
                          <option value="India">India</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Payment Method
                    </h2>
                    {!paymentMethod && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">Please select a payment method to continue</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {Object.keys(appSettings.payment || {}).length === 0 ? (
                        <div className="text-center py-8"><p className="text-gray-400">Loading payment methods...</p></div>
                      ) : (
                        <>
                          {appSettings.payment?.razorpay?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3">
                                <CreditCardIcon className="h-7 w-7 text-blue-500" />
                                <div><span className="text-gray-900 font-semibold">Razorpay</span><p className="text-gray-500 text-sm">Pay securely with cards, UPI, wallets & more</p></div>
                              </div>
                            </label>
                          )}
                          {appSettings.payment?.stripe?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3">
                                <CreditCardIcon className="h-7 w-7 text-purple-500" />
                                <div><span className="text-gray-900 font-semibold">Stripe</span><p className="text-gray-500 text-sm">International payments with credit/debit cards</p></div>
                              </div>
                            </label>
                          )}
                          {appSettings.payment?.cod?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3">
                                <TruckIcon className="h-7 w-7 text-green-500" />
                                <div><span className="text-gray-900 font-semibold">Cash on Delivery</span>
                                  <p className="text-gray-500 text-sm">Pay when you receive your order{appSettings.payment?.cod?.maximumAmount && <span className="block text-xs text-amber-600">Available for orders up to ₹{appSettings.payment.cod.maximumAmount.toLocaleString()}</span>}</p>
                                </div>
                              </div>
                            </label>
                          )}
                          {appSettings.payment?.qr?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3">
                                <QrCodeIcon className="h-7 w-7 text-green-500" />
                                <div><span className="text-gray-900 font-semibold">QR Code Payment</span><p className="text-gray-500 text-sm">Pay using UPI QR code</p></div>
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
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Review Your Order
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Order Items */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Items ({items.length})</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.product._id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-gray-100">
                              <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {item.product.images?.[0]?.url ? (<img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />) : null}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm">{item.product.name}</p>
                                <p className="text-gray-400 text-xs">₹{(item.product.discountPrice || item.product.price).toLocaleString()} × {item.quantity}</p>
                              </div>
                              <p className="text-violet-600 font-semibold text-sm">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment Details */}
                      <div className="space-y-4">
                        {/* Shipping Address */}
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Shipping Address</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 text-sm">
                            <p className="text-gray-900 font-medium">{formData.name}</p>
                            <p className="text-gray-500">{formData.phone}</p>
                            {formData.email && <p className="text-gray-500">{formData.email}</p>}
                            <div className="mt-1.5 text-gray-500">
                              <p>{formData.street}</p>
                              <p>{formData.city}, {formData.state} {formData.pincode}</p>
                              <p>{formData.country}</p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Payment Method</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 text-sm">
                            <p className="text-gray-900 font-medium">
                              {paymentMethod === 'razorpay' && 'Razorpay'}
                              {paymentMethod === 'stripe' && 'Stripe'}
                              {paymentMethod === 'cod' && 'Cash on Delivery'}
                              {paymentMethod === 'qr' && 'QR Code Payment'}
                            </p>
                            <p className="text-gray-500">
                              {paymentMethod === 'razorpay' && 'Cards, UPI, wallets & more'}
                              {paymentMethod === 'stripe' && 'International credit/debit cards'}
                              {paymentMethod === 'cod' && 'Pay when you receive your order'}
                              {paymentMethod === 'qr' && 'Pay using UPI QR code'}
                            </p>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Order Summary</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                            {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon?.code})</span><span>-₹{discount.toLocaleString()}</span></div>}
                            {loyaltyDiscount > 0 && <div className="flex justify-between text-green-600"><span>Loyalty ({loyaltyPointsToUse} pts)</span><span>-₹{loyaltyDiscount.toLocaleString()}</span></div>}
                            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                            <div className="flex justify-between text-gray-500"><span>Tax ({taxRate}% {appSettings.tax?.name || 'GST'})</span><span>₹{taxAmount.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2"><span>Total</span><span className="text-violet-600">₹{total.toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-700 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Please review all details carefully before confirming your order.
                      </p>
                    </div>
                  </div>
                )}
              </form>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button type="button" onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
                    {currentStep === 3 ? 'Review Order' : 'Next'}
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-violet-200">
                    {loading ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Processing...</span></>
                    ) : (
                      <><ShieldCheckIcon className="h-5 w-5" /><span>Confirm Order · ₹{total.toLocaleString()}</span></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-100 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images?.[0]?.url ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className="hidden w-full h-full flex-col items-center justify-center p-1 text-center">
                          <span className="text-violet-600 font-bold text-[9px] leading-tight break-words">{item.product.name}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-violet-600 font-semibold text-sm">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon?.code})</span><span>-₹{discount.toLocaleString()}</span></div>}
                  {loyaltyDiscount > 0 && <div className="flex justify-between text-green-600"><span>Loyalty ({loyaltyPointsToUse} pts)</span><span>-₹{loyaltyDiscount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Tax ({taxRate}% {appSettings.tax?.name || 'GST'})</span><span>₹{taxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 text-base">
                    <span>Total</span><span className="text-violet-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-5 text-sm">
                    <div className="flex items-center gap-1.5 text-green-600">
                      <ShieldCheckIcon className="h-4 w-4" /><span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-600">
                      <TruckIcon className="h-4 w-4" />
                      <span className="text-xs">{appSettings.shipping?.estimatedDelivery?.standard || '5-7 business days'}</span>
                    </div>
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