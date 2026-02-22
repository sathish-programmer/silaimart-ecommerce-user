import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    MagnifyingGlassIcon, TruckIcon, CheckCircleIcon, CubeIcon,
    MapPinIcon, CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TrackOrderPage = () => {
    const [searchParams] = useSearchParams();
    const initialOrderId = searchParams.get('orderId') || '';
    const [orderId, setOrderId] = useState(initialOrderId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (initialOrderId) handleTrack(initialOrderId);
    }, [initialOrderId]);

    const handleTrack = async (idOrEvent) => {
        let id = idOrEvent;
        if (idOrEvent?.preventDefault) { idOrEvent.preventDefault(); id = orderId; }
        if (!id || !id.trim()) return;
        setLoading(true); setError(null); setOrderData(null);
        try {
            const cleanId = id.trim().replace(/^#/, '').toUpperCase();
            const response = await axios.get(`${API_URL}/orders/track/${cleanId}`);
            if (response.data.success) setOrderData(response.data.order);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to find order. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    return (
        <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2 mb-4">
                            <TruckIcon className="h-4 w-4 text-violet-500" />
                            <span className="text-violet-600 text-sm font-medium">Real-time tracking</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Track Your Order</h1>
                        <p className="text-gray-500 text-lg">Enter your Order ID to see real-time updates and delivery status.</p>
                    </motion.div>
                </div>

                {/* Search Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-0">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter Order ID (e.g., SM123456...)"
                                className="block w-full pl-12 pr-4 py-4 bg-stone-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !orderId}
                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold text-base shadow-md shadow-violet-200 hover:shadow-violet-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><span>Track Order</span><TruckIcon className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-700 text-sm">Order Not Found</h3>
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Order Result */}
                {orderData && (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                        className="space-y-6">
                        {/* Status Banner */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Current Status</p>
                                <h2 className="text-3xl font-bold text-violet-600 capitalize flex items-center gap-3">
                                    {orderData.status}
                                    <span className={`inline-block w-3 h-3 rounded-full ${orderData.status === 'delivered' ? 'bg-green-400' : 'bg-violet-500 animate-pulse'}`} />
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Order placed on {new Date(orderData.statusHistory[0].date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Expected Delivery</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {orderData.status === 'delivered'
                                        ? `Delivered on ${orderData.deliveredAt ? new Date(orderData.deliveredAt).toLocaleDateString() : 'N/A'}`
                                        : (orderData.estimatedDeliveryDate ? new Date(orderData.estimatedDeliveryDate).toLocaleDateString() : 'Date pending')}
                                </p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">Order Progress</h3>
                            <div className="relative">
                                {/* Progress Line */}
                                <div className="hidden md:block absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
                                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0 relative">
                                    {orderData.statusHistory.map((step, idx) => {
                                        const isCompleted = step.completed;
                                        return (
                                            <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1">
                                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 flex-shrink-0 ${isCompleted ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />}
                                                </div>
                                                <div className="md:text-center flex-1">
                                                    <p className={`font-medium text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                                    </p>
                                                    {isCompleted && step.date && (
                                                        <p className="text-violet-500 text-xs mt-0.5">
                                                            {new Date(step.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Shipping */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5 text-violet-500" />Shipping Address
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="font-semibold text-gray-900">{orderData.shippingAddress?.name}</p>
                                    <p>{orderData.shippingAddress?.street}</p>
                                    <p>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.pincode}</p>
                                    <div className="pt-4 border-t border-gray-100 mt-4">
                                        <p className="text-xs text-gray-400 mb-1">Tracking Number</p>
                                        <p className="text-gray-900 font-mono text-sm">{orderData.trackingNumber || 'Pending Assignment'}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Items */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CubeIcon className="w-5 h-5 text-violet-500" />Order Items ({orderData.items.length})
                                </h3>
                                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                                    {orderData.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-stone-50 rounded-xl">
                                            <div className="w-14 h-14 rounded-lg bg-violet-50 overflow-hidden flex-shrink-0">
                                                {item.product?.images?.[0]?.url ? (
                                                    <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-violet-300">
                                                        <CubeIcon className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 text-sm truncate">{item.product?.name || 'Product'}</h4>
                                                <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                                                <p className="text-violet-600 font-semibold text-sm mt-1 flex items-center gap-0.5">
                                                    <CurrencyRupeeIcon className="w-3.5 h-3.5" />{item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total</span>
                                    <span className="text-gray-900 font-bold flex items-center gap-0.5">
                                        <CurrencyRupeeIcon className="w-4 h-4" />
                                        {orderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
