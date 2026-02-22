import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PolicyPage = () => {
  const { type } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type) fetchPolicy(type);
  }, [type]);

  const fetchPolicy = async (policyType) => {
    try {
      const response = await axios.get(`${API_URL}/policies/${policyType}`);
      setPolicy(response.data.policy);
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <DocumentTextIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h1>
          <p className="text-gray-500">The requested policy is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-amber-300" />
            </div>
            <h1 className="text-2xl font-bold">{policy.title}</h1>
          </div>
          {policy.lastUpdated && (
            <p className="text-violet-300 text-sm mt-2">
              Last updated: {new Date(policy.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100">
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;