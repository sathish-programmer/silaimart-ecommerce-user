import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { EnvelopeIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src="/silaimartlogo.png" alt="SilaiMart" className="h-12 w-auto mx-auto" /></Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {emailSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We've sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
                <ArrowLeftIcon className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <EnvelopeIcon className="h-6 w-6 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit" disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;