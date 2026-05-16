import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import {
  CreditCardIcon, QrCodeIcon, TruckIcon, ShieldCheckIcon,
  MapPinIcon, CheckCircleIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ─── Load Razorpay script dynamically ─── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    street: '', city: '', state: '', pincode: '', country: 'India'
  });
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
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
  const dropdownRef = useRef(null);

  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  /* ─── Close dropdown on outside click ─── */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ─── On mount ─── */
  useEffect(() => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }
    if (items.length === 0 && currentStep === 1) {
      navigate('/cart');
      return;
    }
    fetchAppSettings();
    fetchAvailableCoupons();
    loadRazorpayScript(); // pre-load so it's ready

    // Pre-fill name / email / phone
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));

      // Auto-fill default address if available
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        applyAddress(defaultAddr);
        setSelectedAddressId(defaultAddr._id);
      }
    }
  }, [user, items, navigate, currentStep]);

  /* ─── Apply a saved address to formData ─── */
  const applyAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      name: addr.fullName || prev.name,
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India'
    }));
  };

  const fetchAppSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/public`);
      const settings = response.data.settings || {};
      setAppSettings(settings);
      if (!paymentMethod) {
        if (settings.payment?.razorpay?.enabled) setPaymentMethod('razorpay');
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
    if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return; }
    try {
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code: couponCode.toUpperCase(), amount: getTotal()
      });
      const { coupon, discount: discountAmount } = response.data;
      setDiscount(discountAmount);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! ${coupon.type === 'percentage' ? coupon.value + '%' : '₹' + coupon.value} discount`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setDiscount(0); setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setDiscount(0); setAppliedCoupon(null); setCouponCode('');
    toast.success('Coupon removed');
  };

  const calculateTotals = () => {
    const subtotal = getTotal();
    const mrpTotal = items.reduce((s, i) => s + (i.product.price || i.product.discountPrice || 0) * i.quantity, 0);
    const mrpDiscount = mrpTotal - subtotal;
    const freeShippingThreshold = appSettings.shipping?.freeShippingThreshold ?? 1000;
    const standardShippingCost = appSettings.shipping?.standardShipping ?? 50;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
    const taxRate = appSettings.tax?.rate ?? 18;
    const taxEnabled = appSettings.tax?.enabled !== false;
    const wowDiscount = appSettings.offers?.wowDeal?.enabled ? Math.round(subtotal * (appSettings.offers.wowDeal.discountPercentage || 15) / 100) : 0;
    const totalDiscount = discount + loyaltyDiscount + wowDiscount;
    const taxAmount = taxEnabled ? Math.round((subtotal - totalDiscount) * (taxRate / 100)) : 0;
    const total = Math.max(0, subtotal - totalDiscount + shippingCost + taxAmount);
    return { subtotal, mrpTotal, mrpDiscount, shippingCost, taxAmount, total, taxRate, totalDiscount, wowDiscount };
  };

  const { subtotal, mrpTotal, mrpDiscount, shippingCost, taxAmount, total, taxRate, totalDiscount, wowDiscount } = calculateTotals();

  const handleLoyaltyPointsToggle = (checked) => {
    setUseLoyaltyPoints(checked);
    if (checked && user?.loyaltyPoints > 0) {
      const maxPoints = Math.min(user.loyaltyPoints, Math.floor(subtotal - discount));
      setLoyaltyPointsToUse(maxPoints); setLoyaltyDiscount(maxPoints);
    } else {
      setLoyaltyPointsToUse(0); setLoyaltyDiscount(0);
    }
  };

  const handleLoyaltyPointsChange = (points) => {
    const maxPoints = Math.min(user?.loyaltyPoints || 0, Math.floor(subtotal - discount));
    const validPoints = Math.max(0, Math.min(points, maxPoints));
    setLoyaltyPointsToUse(validPoints); setLoyaltyDiscount(validPoints);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: return items.length > 0;
      case 2:
        return formData.name.trim() && formData.phone.trim() && formData.email.trim() &&
          formData.street.trim() && formData.city.trim() && formData.state.trim() && formData.pincode.trim();
      case 3: return paymentMethod !== '';
      case 4: return true;
      default: return false;
    }
  };

  const handleQRCodeGeneration = async () => {
    try {
      setLoading(true);
      const { total } = calculateTotals();
      const response = await axios.post(`${API_URL}/payments/qr/generate`, {
        amount: total, orderId: 'preview'
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (response.data?.qrCode) {
        setQrCodeData({ ...response.data, previewAmount: total, isPreview: true });
        setShowQRCode(true);
      } else {
        toast.error('Invalid QR code response from server');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3 && paymentMethod === 'qr') {
        await handleQRCodeGeneration();
        return;
      }
      setCurrentStep(prev => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ─────────────────────────────────────────────
     handleSubmit — creates order then pays
  ───────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Please enter your full name'); return; }
    if (!formData.phone.trim()) { toast.error('Please enter your phone number'); return; }
    if (!formData.email.trim()) { toast.error('Please enter your email address'); return; }
    if (!formData.street.trim()) { toast.error('Please enter your street address'); return; }
    if (!formData.city.trim()) { toast.error('Please enter your city'); return; }
    if (!formData.state.trim()) { toast.error('Please enter your state'); return; }
    if (!formData.pincode.trim()) { toast.error('Please enter your PIN code'); return; }
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }

    // ── RAZORPAY SPECIAL FLOW — Pay first, then create ──
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await axios.post(`${API_URL}/orders`, {
        items: items.map(item => ({ product: item.product._id, quantity: item.quantity })),
        shippingAddress: formData,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      const order = orderResponse.data.order;

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${order._id}`);
      } else if (paymentMethod === 'qr') {
        clearCart();
        navigate(`/order-success/${order._id}`);
      } else if (paymentMethod === 'stripe') {
        const toastId = toast.loading('Initiating Stripe Secure Checkout...');
        try {
          const stripeInit = await axios.post(`${API_URL}/payments/stripe/create`, {
            amount: total,
            currency: 'inr',
            orderId: order._id
          }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

          const { payment_intent_id } = stripeInit.data;
          toast.loading('Confirming payment...', { id: toastId });

          await axios.post(`${API_URL}/payments/stripe/confirm`, {
            payment_intent_id,
            orderId: order._id
          }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

          toast.success('Payment successful!', { id: toastId });
          clearCart();
          navigate(`/order-success/${order._id}`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Stripe payment failed', { id: toastId });
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────
     RAZORPAY — full end-to-end (Pay then Create)
  ───────────────────────────────────────────── */
  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Ensure script is loaded
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error('Razorpay could not be loaded. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 1. Initiate Razorpay order on backend (no shop order created yet)
      const initResponse = await axios.post(
        `${API_URL}/payments/razorpay/create`,
        { 
          items: items.map(item => ({ product: item.product._id, quantity: item.quantity })),
          couponCode: appliedCoupon?.code,
          loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const { razorpayOrder, calculatedTotal } = initResponse.data;
      const keyId = appSettings.payment?.razorpay?.keyId;

      if (!keyId) {
        toast.error('Razorpay is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,      // paise
        currency: razorpayOrder.currency,
        name: 'SilaiMart',
        description: 'Quality Art & Fabrics',
        // image: '/logo.png',            // Removed local path to avoid CORS issues
        order_id: razorpayOrder.id,        // Razorpay order ID
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#7c3aed'                 // violet-600
        },
        /* ── Explicitly enable standard methods ── */
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true
        },
        /* ── Handle modal dismissal (cancel) ── */
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            setLoading(false);
          }
        },
        /* ── handler called on successful payment ── */
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyResponse = await axios.post(
              `${API_URL}/payments/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: { // All info needed to create the order now
                  items: items.map(item => ({ product: item.product._id, quantity: item.quantity })),
                  shippingAddress: formData,
                  couponCode: appliedCoupon?.code,
                  loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0
                }
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            const createdOrder = verifyResponse.data.order;
            clearCart();
            navigate(`/order-success/${createdOrder._id}`);
          } catch (err) {
            console.error('Verification/Save error:', err);
            toast.error(err.response?.data?.message || 'Payment verified but order creation failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      /* ── Handle payment failure / modal dismiss ── */
      rzp.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay init error:', error);
      toast.error(error.response?.data?.message || 'Payment initialization failed.');
      setLoading(false);
    }
  };

  /* ─── QR preview / full screens ─── */
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
          <div className="space-y-3">
            <button onClick={() => { clearCart(); navigate(`/order-success/${qrCodeData.order._id}`); }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              I've Completed Payment
            </button>
            <button onClick={() => { setShowQRCode(false); toast.info('Payment cancelled.'); }}
              className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     MAIN LAYOUT
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-stone-50 py-8 pt-[11.5rem]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
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
                  : 'border-gray-300 text-gray-500 bg-white'
                  }`}>
                  <span className="text-base">{item.icon}</span>
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-xs font-medium ${currentStep >= item.step ? 'text-violet-600' : 'text-gray-600'}`}>{item.title}</p>
                </div>
                {index < 4 && (
                  <div className={`w-10 h-0.5 mx-3 ${currentStep > item.step ? 'bg-violet-500' : 'bg-gray-200'}`} />
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

                {/* ── STEP 1: Cart Review ── */}
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
                              <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div className="hidden w-full h-full flex-col items-center justify-center p-1 text-center">
                              <span className="text-violet-600 font-bold text-[10px] leading-tight break-words">{item.product.name}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-semibold">{item.product.name}</h3>
                            <p className="text-gray-600 text-sm">{item.product.category?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-violet-600 font-bold">₹{(item.product.discountPrice || item.product.price).toLocaleString()}</span>
                              <span className="text-gray-600 text-sm">× {item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-gray-900 font-bold">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Coupon */}
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
                                  <p className="text-gray-500 text-xs">{coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}</p>
                                </div>
                                <button onClick={() => { setCouponCode(coupon.code); setShowCoupons(false); }}
                                  className="text-xs bg-violet-600 text-white px-2 py-1 rounded-lg hover:bg-violet-700">Use</button>
                              </div>
                            ))}
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

                    {/* Loyalty Points */}
                    {user?.loyaltyPoints > 0 && (
                      <div className="mt-5 p-4 bg-stone-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-900 font-semibold">Use Loyalty Points</h3>
                          <div className="text-violet-600 text-sm font-medium">{user.loyaltyPoints} pts available</div>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <input type="checkbox" id="useLoyaltyPoints" checked={useLoyaltyPoints}
                            onChange={(e) => handleLoyaltyPointsToggle(e.target.checked)} className="accent-violet-600" />
                          <label htmlFor="useLoyaltyPoints" className="text-gray-700 text-sm">Use loyalty points (1 point = ₹1 discount)</label>
                        </div>
                        {useLoyaltyPoints && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input type="number" value={loyaltyPointsToUse}
                                onChange={(e) => handleLoyaltyPointsChange(Number(e.target.value))}
                                min="0" max={Math.min(user.loyaltyPoints, Math.floor(subtotal - discount))}
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none" />
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

                {/* ── STEP 2: Shipping ── */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Shipping Address
                    </h2>

                    {/* ── Saved Address Selector ── */}
                    {user?.addresses?.length > 0 && (
                      <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPinIcon className="h-5 w-5 text-violet-600" />
                          <h3 className="text-violet-700 font-semibold text-sm">Use a Saved Address</h3>
                        </div>
                        <div className="space-y-2">
                          {user.addresses.map((addr) => (
                            <label key={addr._id}
                              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 bg-white hover:border-violet-300'
                                }`}>
                              <input type="radio" name="savedAddress" value={addr._id}
                                checked={selectedAddressId === addr._id}
                                onChange={() => { setSelectedAddressId(addr._id); applyAddress(addr); }}
                                className="mt-1 accent-violet-600" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 font-semibold text-sm">{addr.fullName}</span>
                                  {addr.isDefault && (
                                    <span className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Default</span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-xs mt-0.5">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                              </div>
                              {selectedAddressId === addr._id && (
                                <CheckCircleIcon className="h-5 w-5 text-violet-600 flex-shrink-0" />
                              )}
                            </label>
                          ))}
                          <button type="button"
                            onClick={() => { setSelectedAddressId(''); setFormData(prev => ({ ...prev, street: '', city: '', state: '', pincode: '' })); }}
                            className="text-sm text-violet-600 hover:text-violet-700 font-medium mt-1">
                            + Enter a new address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address form */}
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

                {/* ── STEP 3: Payment ── */}
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
                          {/* Razorpay */}
                          {appSettings.payment?.razorpay?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <img src="https://razorpay.com/favicon.png" className="w-6 h-6 object-contain" alt="Razorpay"
                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                                <div className="flex-1">
                                  <span className="text-gray-900 font-semibold block">Razorpay</span>
                                  <p className="text-gray-600 text-sm">Cards, UPI, Net Banking, Wallets & more</p>
                                </div>
                                {paymentMethod === 'razorpay' && (
                                  <div className="flex gap-1.5 flex-wrap">
                                    {['UPI', 'Card', 'Wallet'].map(t => (
                                      <span key={t} className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </label>
                          )}

                          {/* Stripe */}
                          {appSettings.payment?.stripe?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-purple-600" />
                              <div className="ml-4 flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-gray-900 font-semibold block">Stripe Checkout</span>
                                  <p className="text-gray-600 text-sm">International & Domestic Credit / Debit Cards</p>
                                </div>
                                {paymentMethod === 'stripe' && (
                                  <div className="flex gap-1.5 flex-wrap">
                                    {['Visa', 'Mastercard', 'Amex'].map(t => (
                                      <span key={t} className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium">{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </label>
                          )}

                          {/* Cash on Delivery */}
                          {appSettings.payment?.cod?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-violet-600" />
                              <div className="ml-4 flex items-center gap-3">
                                <TruckIcon className="h-7 w-7 text-green-500" />
                                <div>
                                  <span className="text-gray-900 font-semibold">Cash on Delivery</span>
                                  <p className="text-gray-600 text-sm">Pay when you receive your order
                                    {appSettings.payment?.cod?.maximumAmount && <span className="block text-xs text-amber-600">Available for orders up to ₹{appSettings.payment.cod.maximumAmount.toLocaleString()}</span>}
                                  </p>
                                </div>
                              </div>
                            </label>
                          )}

                          {/* QR */}
                          {appSettings.payment?.qr?.enabled && (
                            <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
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

                    {/* Razorpay info badge when selected */}
                    {paymentMethod === 'razorpay' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-700 text-xs leading-relaxed">
                          You'll be redirected to <b>Razorpay's secure checkout</b>. On mobile, selecting <b>UPI</b> will open your installed UPI apps (GPay, PhonePe, Paytm, etc.) directly.
                        </p>
                      </div>
                    )}

                    {/* Stripe info badge when selected */}
                    {paymentMethod === 'stripe' && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-start gap-3">
                        <ShieldCheckIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <p className="text-purple-700 text-xs leading-relaxed">
                          You'll be redirected to <b>Stripe's secure encrypted gateway</b> for processing your credit/debit card payment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 4: Order Preview ── */}
                {currentStep === 4 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Review Your Order
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Items */}
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
                                <p className="text-gray-600 text-xs">₹{(item.product.discountPrice || item.product.price).toLocaleString()} × {item.quantity}</p>
                              </div>
                              <p className="text-violet-600 font-semibold text-sm">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Details */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Shipping Address</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 text-sm">
                            <p className="text-gray-900 font-medium">{formData.name}</p>
                            <p className="text-gray-700">{formData.phone}</p>
                            {formData.email && <p className="text-gray-700">{formData.email}</p>}
                            <div className="mt-1.5 text-gray-700">
                              <p>{formData.street}</p>
                              <p>{formData.city}, {formData.state} {formData.pincode}</p>
                              <p>{formData.country}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Payment Method</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 text-sm">
                            <p className="text-gray-900 font-medium">
                              {paymentMethod === 'razorpay' && '💳 Razorpay'}
                              {paymentMethod === 'stripe' && '💳 Stripe Checkout'}
                              {paymentMethod === 'cod' && '🚚 Cash on Delivery'}
                              {paymentMethod === 'qr' && '📱 QR Code Payment'}
                            </p>
                            <p className="text-gray-700">
                              {paymentMethod === 'razorpay' && 'Cards, UPI, wallets & more'}
                              {paymentMethod === 'stripe' && 'International & Domestic Credit / Debit Cards'}
                              {paymentMethod === 'cod' && 'Pay when you receive your order'}
                              {paymentMethod === 'qr' && 'Pay using UPI QR code'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Order Summary</h3>
                          <div className="bg-stone-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-700"><span>Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>₹{mrpTotal.toLocaleString()}</span></div>
                            {mrpDiscount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>Discount on MRP</span><span>-₹{mrpDiscount.toLocaleString()}</span></div>}
                            {wowDiscount > 0 && <div className="flex justify-between text-blue-600 font-bold"><span>WOW! Deal Applied</span><span>-₹{wowDiscount.toLocaleString()}</span></div>}
                            {discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon ({appliedCoupon?.code})</span><span>-₹{discount.toLocaleString()}</span></div>}
                            {loyaltyDiscount > 0 && <div className="flex justify-between text-green-700"><span>Loyalty ({loyaltyPointsToUse} pts)</span><span>-₹{loyaltyDiscount.toLocaleString()}</span></div>}
                            <div className="flex justify-between text-gray-700"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                            <div className="flex justify-between text-gray-700"><span>Tax ({taxRate}% GST)</span><span>₹{taxAmount.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2"><span>Total</span><span className="text-violet-600">₹{total.toLocaleString()}</span></div>
                          </div>
                          {(mrpDiscount + wowDiscount + discount + loyaltyDiscount) > 0 && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-emerald-700 font-black text-xs shadow-sm">
                              You'll save ₹{(mrpDiscount + wowDiscount + discount + loyaltyDiscount).toLocaleString()} on this order!
                            </div>
                          )}
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

              {/* Navigation */}
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
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
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
                  <div className="flex justify-between text-gray-500"><span>Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>₹{mrpTotal.toLocaleString()}</span></div>
                  {mrpDiscount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>Discount on MRP</span><span>-₹{mrpDiscount.toLocaleString()}</span></div>}
                  {wowDiscount > 0 && <div className="flex justify-between text-blue-600 font-bold"><span>WOW! Deal Applied</span><span>-₹{wowDiscount.toLocaleString()}</span></div>}
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon?.code})</span><span>-₹{discount.toLocaleString()}</span></div>}
                  {loyaltyDiscount > 0 && <div className="flex justify-between text-green-600"><span>Loyalty ({loyaltyPointsToUse} pts)</span><span>-₹{loyaltyDiscount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Tax ({taxRate}% GST)</span><span>₹{taxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 text-base">
                    <span>Total</span><span className="text-violet-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                {(mrpDiscount + wowDiscount + discount + loyaltyDiscount) > 0 && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-emerald-700 font-black text-xs shadow-sm">
                    You'll save ₹{(mrpDiscount + wowDiscount + discount + loyaltyDiscount).toLocaleString()} on this order!
                  </div>
                )}
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