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
    if (type) {
      fetchPolicy(type);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Policy Not Found</h1>
          <p className="text-gray-400">The requested policy is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center space-x-3 mb-8">
            <DocumentTextIcon className="h-8 w-8 text-bronze" />
            <h1 className="text-3xl font-bold text-white">{policy.title}</h1>
          </div>
          
          <div className="text-gray-300 leading-relaxed">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              Last updated: {new Date(policy.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;