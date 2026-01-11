import { useState } from 'react';
import toast from 'react-hot-toast';

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
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">Support Center</h1>
          <p className="text-xl text-gray-300">We're here to help you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              />
              <input
                type="text"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              />
              <textarea
                rows={5}
                placeholder="Your Message"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bronze text-black py-3 rounded-lg font-semibold hover:bg-gold disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium">Phone</h3>
                  <p className="text-gray-300">+91 98765 43210</p>
                  <p className="text-gray-400 text-sm">Mon-Sat 9AM-6PM IST</p>
                </div>

                <div>
                  <h3 className="text-white font-medium">Email</h3>
                  <p className="text-gray-300">support@silaimart.com</p>
                  <p className="text-gray-400 text-sm">We'll respond within 24 hours</p>
                </div>

                <div>
                  <h3 className="text-white font-medium">Address</h3>
                  <p className="text-gray-300">
                    123 Craft Street<br />
                    Chennai, Tamil Nadu 600001<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-4">FAQ</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-bronze font-medium">How long does shipping take?</h4>
                  <p className="text-gray-300 text-sm">Usually 3-7 business days within India.</p>
                </div>
                <div>
                  <h4 className="text-bronze font-medium">Do you ship internationally?</h4>
                  <p className="text-gray-300 text-sm">Yes, we ship worldwide with additional charges.</p>
                </div>
                <div>
                  <h4 className="text-bronze font-medium">What's your return policy?</h4>
                  <p className="text-gray-300 text-sm">30-day return policy for damaged items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;