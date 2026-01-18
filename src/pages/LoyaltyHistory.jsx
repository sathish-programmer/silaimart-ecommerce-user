import { useState, useEffect } from 'react';
import { 
  GiftIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon,
  StarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LoyaltyHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLoyaltyData();
  }, [page]);

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
      case 'earned':
        return <ArrowUpIcon className="h-5 w-5 text-green-400" />;
      case 'redeemed':
        return <ArrowDownIcon className="h-5 w-5 text-red-400" />;
      case 'expired':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'refunded':
        return <ArrowUpIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <GiftIcon className="h-5 w-5 text-bronze" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned':
        return 'text-green-400';
      case 'redeemed':
        return 'text-red-400';
      case 'expired':
        return 'text-gray-400';
      case 'refunded':
        return 'text-blue-400';
      default:
        return 'text-bronze';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Loyalty Points History</h1>
          <p className="text-gray-400">Track your loyalty points earnings and redemptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Current Balance</p>
                <p className="text-2xl font-bold text-white">{stats.currentBalance || 0}</p>
                <p className="text-green-300 text-xs">points</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <GiftIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Earned</p>
                <p className="text-2xl font-bold text-white">{stats.totalEarned || 0}</p>
                <p className="text-blue-300 text-xs">points</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ArrowUpIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Total Redeemed</p>
                <p className="text-2xl font-bold text-white">{stats.totalRedeemed || 0}</p>
                <p className="text-red-300 text-xs">points</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-900 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <GiftIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Transactions Yet</h3>
              <p className="text-gray-500">Start shopping to earn loyalty points!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-6 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {transaction.orderId && (
                            <>
                              <span className="text-gray-600">•</span>
                              <p className="text-gray-400 text-sm">
                                Order #{transaction.metadata?.orderNumber || transaction.orderId.slice(-8)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'earned' || transaction.type === 'refunded' ? '+' : '-'}
                        {transaction.points}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-gradient-to-br from-bronze/10 to-gold/10 border border-bronze/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Loyalty Points Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBagIcon className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Earn Points</p>
                <p className="text-gray-400 text-sm">Get 1 point for every ₹100 spent on delivered orders</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <GiftIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Redeem Points</p>
                <p className="text-gray-400 text-sm">Use points as discount: 1 point = ₹1 off your order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyHistory;