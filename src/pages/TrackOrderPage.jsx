import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    MagnifyingGlassIcon,
    TruckIcon,
    CheckCircleIcon,
    CubeIcon,
    MapPinIcon,
    CalendarIcon,
    CurrencyRupeeIcon
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
        if (initialOrderId) {
            handleTrack(initialOrderId);
        }
    }, [initialOrderId]);

    const handleTrack = async (idOrEvent) => {
        let id = idOrEvent;
        if (idOrEvent?.preventDefault) {
            idOrEvent.preventDefault();
            id = orderId;
        }

        if (!id || !id.trim()) return;

        setLoading(true);
        setError(null);
        setOrderData(null);

        try {
            const cleanId = id.trim().replace(/^#/, '').toUpperCase();
            const response = await axios.get(`${API_URL}/orders/track/${cleanId}`);

            if (response.data.success) {
                setOrderData(response.data.order);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to find order. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-bronze to-white mb-4">
                            Track Your Order
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Enter your Order ID to see real-time updates and delivery status.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl"
                >
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter Order ID (e.g., SM123456...)"
                                className="block w-full pl-12 pr-4 py-4 bg-black/50 border border-gray-700 rounded-xl text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bronze focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !orderId}
                            className="px-8 py-4 bg-gradient-to-r from-bronze to-amber-700 rounded-xl font-bold text-lg shadow-lg shadow-bronze/20 hover:shadow-bronze/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Track Order</span>
                                    <TruckIcon className="h-6 w-6" />
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-400"
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Error Tracking Order</h3>
                                <p>{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {orderData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8 animate-in fade-in slide-in-from-bottom-4"
                        >
                            {/* Status Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-gray-700">
                                <div>
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Current Status</p>
                                    <h2 className="text-3xl font-bold text-bronze capitalize flex items-center gap-3">
                                        {orderData.status}
                                        <span className={`inline-block w-3 h-3 rounded-full ${orderData.status === 'delivered' ? 'bg-green-500' : 'bg-bronze animate-pulse'}`}></span>
                                    </h2>
                                    <p className="text-gray-400 mt-2">Order placed on {new Date(orderData.statusHistory[0].date).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Expected Delivery</p>
                                    <p className="text-xl font-semibold text-white">
                                        {orderData.status === 'delivered'
                                            ? `Delivered on ${orderData.deliveredAt ? new Date(orderData.deliveredAt).toLocaleDateString() : 'N/A'}`
                                            : (orderData.estimatedDeliveryDate
                                                ? new Date(orderData.estimatedDeliveryDate).toLocaleDateString()
                                                : 'Date pending'
                                            )
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="relative pl-4 md:pl-0">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800 md:hidden"></div>
                                <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-gray-800"></div>

                                <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
                                    {orderData.statusHistory.map((step, idx) => {
                                        const isCompleted = step.completed;
                                        const isCurrent = step.status === orderData.status;

                                        return (
                                            <div key={idx} className="flex md:flex-col items-center md:items-center gap-4 md:gap-4 relative group flex-1">
                                                {/* Circle Indicator */}
                                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 relative ${isCompleted
                                                    ? 'bg-bronze border-bronze text-white shadow-[0_0_15px_rgba(205,127,50,0.4)]'
                                                    : 'bg-black border-gray-700 text-gray-600'
                                                    }`}>
                                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-gray-700" />}
                                                </div>

                                                {/* Text Info */}
                                                <div className="md:text-center flex-1">
                                                    <p className={`font-medium text-lg transition-colors ${isCompleted ? 'text-white' : 'text-gray-500'
                                                        }`}>
                                                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                                    </p>
                                                    {isCompleted && step.date && (
                                                        <p className="text-sm text-bronze/80 mt-1">
                                                            {new Date(step.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                {/* Shipping Details */}
                                <div className="bg-black/30 rounded-2xl p-6 border border-gray-800">
                                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <MapPinIcon className="w-5 h-5 text-bronze" />
                                        Shipping Address
                                    </h3>
                                    <div className="space-y-4 text-gray-300">
                                        <p className="font-medium text-white text-lg">{orderData.shippingAddress?.name}</p>
                                        <p>{orderData.shippingAddress?.street}</p>
                                        <p>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.pincode}</p>
                                        <div className="pt-4 border-t border-gray-800 mt-4">
                                            <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                                            <p className="text-white font-mono tracking-wider">
                                                {orderData.trackingNumber || 'Pending Assignment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-black/30 rounded-2xl p-6 border border-gray-800">
                                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                        <CubeIcon className="w-5 h-5 text-bronze" />
                                        Order Items ({orderData.items.length})
                                    </h3>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
                                        {orderData.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-gray-800">
                                                <div className="w-20 h-20 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                                    {item.product?.images?.[0]?.url ? (
                                                        <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <CubeIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">{item.product?.name || 'Product'}</h4>
                                                    <p className="text-sm text-gray-400 mt-1">Quantity: {item.quantity}</p>
                                                    <p className="text-bronze font-semibold mt-2 flex items-center gap-1">
                                                        <CurrencyRupeeIcon className="w-4 h-4" />
                                                        {item.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                                        <span className="text-gray-400">Total Amount</span>
                                        <span className="text-xl font-bold text-white flex items-center gap-1">
                                            <CurrencyRupeeIcon className="w-5 h-5" />
                                            {orderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default TrackOrderPage;
