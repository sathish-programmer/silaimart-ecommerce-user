import { useState, useEffect } from 'react';
import { GiftIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LoyaltyHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchLoyaltyData(); }, [page]);

  const fetchLoyaltyData = async () => {
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/loyalty/history?page=${page}&limit=20`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/loyalty/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setTransactions(historyResponse.data.transactions || []);
      setTotalPages(historyResponse.data.totalPages || 1);
      setStats(statsResponse.data.stats || {});
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Failed to fetch loyalty points data');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case 'redeemed': return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
      case 'expired': return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'refunded': return <ArrowUpIcon className="h-5 w-5 text-blue-500" />;
      default: return <GiftIcon className="h-5 w-5 text-violet-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned': return 'text-green-600 font-bold';
      case 'redeemed': return 'text-red-500 font-bold';
      case 'expired': return 'text-gray-400 font-bold';
      case 'refunded': return 'text-blue-500 font-bold';
      default: return 'text-violet-600 font-bold';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Loyalty Points</h1>
          <p className="text-gray-500">Track your earnings and redemptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.currentBalance || 0}</p>
                <p className="text-gray-400 text-xs mt-1">points available</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <GiftIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEarned || 0}</p>
                <p className="text-gray-400 text-xs mt-1">all time</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ArrowUpIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-500 text-sm font-medium">Total Redeemed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRedeemed || 0}</p>
                <p className="text-gray-400 text-xs mt-1">all time</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GiftIcon className="h-8 w-8 text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Transactions Yet</h3>
              <p className="text-gray-500 text-sm">Start shopping to earn loyalty points!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="px-6 py-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-gray-400 text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {transaction.orderId && (
                            <><span className="text-gray-300 text-xs">•</span>
                              <p className="text-gray-400 text-xs">Order #{transaction.metadata?.orderNumber || transaction.orderId.slice(-8)}</p></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'earned' || transaction.type === 'refunded' ? '+' : '-'}{transaction.points}
                      </p>
                      <p className="text-gray-400 text-xs">Balance: {transaction.balanceAfter}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium">
                  Previous
                </button>
                <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-6 bg-violet-50 border border-violet-100 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-violet-500" /> How Loyalty Points Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBagIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">Earn Points</p>
                <p className="text-gray-500 text-sm">Get 1 point for every ₹100 spent on delivered orders</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GiftIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">Redeem Points</p>
                <p className="text-gray-500 text-sm">Use points as discount: 1 point = ₹1 off your order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyHistory;