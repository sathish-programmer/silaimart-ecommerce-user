import { useState } from 'react';
import toast from 'react-hot-toast';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all";

const faqs = [
  { q: 'How long does shipping take?', a: 'Usually 3–7 business days within India.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide with additional charges.' },
  { q: "What's your return policy?", a: '30-day return policy for damaged items.' },
];

const contactInfo = [
  { icon: PhoneIcon, label: 'Phone', value: '+91 98765 43210', sub: 'Mon–Sat 9AM–6PM IST' },
  { icon: EnvelopeIcon, label: 'Email', value: 'support@silaimart.com', sub: 'Reply within 24 hours' },
  { icon: MapPinIcon, label: 'Address', value: '123 Craft Street, Chennai, TN 600001', sub: 'India' },
];

const Support = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-5">
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          We're here to help
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Support Center</h1>
        <p className="text-violet-200 text-lg">Get in touch with our team</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-card border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" required placeholder="Full name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required placeholder="you@example.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" required placeholder="How can we help?" value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea rows={5} required placeholder="Describe your issue..." value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={inputClass} />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Get in Touch</h2>
              <div className="space-y-5">
                {contactInfo.map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{label}</p>
                      <p className="text-gray-700 text-sm">{value}</p>
                      <p className="text-gray-400 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">FAQ</h3>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <h4 className="text-primary-600 font-semibold text-sm mb-1">{q}</h4>
                    <p className="text-gray-600 text-sm">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;