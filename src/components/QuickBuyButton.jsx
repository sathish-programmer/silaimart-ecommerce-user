import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BoltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const QuickBuyButton = ({ product, variant }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleQuickBuy = async () => {
    if (loading) return;

    if (!user) {
      toast.error('Please login to use One-Click Buy');
      navigate('/login');
      return;
    }

    if (!user.oneClickEnabled) {
      toast.error('Please enable One-Click Buy in your profile settings');
      navigate('/profile?tab=notifications');
      return;
    }

    const defaultAddress = user.addresses?.find(a => a.isDefault);
    if (!defaultAddress) {
      toast.error('Please add a default shipping address first');
      navigate('/profile?tab=addresses');
      return;
    }

    if (!product || product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Placing your order...');

    try {
      const payload = {
        items: [{
          product: product._id,
          quantity: 1,
          ...(variant?.size && { size: variant.size }),
          ...(variant?.color && { color: variant.color }),
        }],
        shippingAddress: {
          fullName: defaultAddress.fullName,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          country: defaultAddress.country || 'India',
        },
        paymentMethod: 'cod', // One-Click Buy always uses COD; user can pay on delivery
        isQuickBuy: true,
      };

      const response = await api.post('/orders', payload);
      const data = response.data;

      if (data?.orderNumber) {
        toast.success('⚡ Order placed successfully!', { id: toastId });
        navigate(`/order-success/${data.orderNumber}`);
      } else {
        throw new Error(data?.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Quick Buy Error:', error);
      const msg = error.response?.data?.message || error.message || 'Quick Buy failed';
      toast.error(msg, { id: toastId });

      // Graceful fallback to cart on stock/validation errors
      if (error.response?.status === 400 || error.response?.status === 409) {
        navigate('/cart');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleQuickBuy}
      disabled={loading || product.stock === 0}
      className={`group flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 ${
        product.stock === 0
          ? 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
          : loading
          ? 'bg-amber-300 text-stone-600 cursor-wait'
          : 'bg-amber-400 text-stone-900 hover:bg-amber-500 shadow-2xl shadow-amber-100'
      }`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <BoltIcon className="h-5 w-5" />
          One-Click Buy · COD
        </>
      )}
    </button>
  );
};

export default QuickBuyButton;
