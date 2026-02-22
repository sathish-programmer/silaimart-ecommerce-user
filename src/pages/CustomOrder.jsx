import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { uploadMultipleImages } from '../utils/imageUpload';

const CustomOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [masterValues, setMasterValues] = useState({});
  const [formData, setFormData] = useState({
    sculptureType: '', material: '', size: '', height: '', width: '', depth: '',
    color: '', finish: '', description: '', budget: '', timeline: '', specialRequirements: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMasterValues(); }, []);

  const fetchMasterValues = async () => {
    try {
      const response = await apiCall('/master-values');
      const data = await response.json();
      if (response.ok) {
        const valuesMap = {};
        data.masterValues.forEach(category => {
          valuesMap[category.category] = category.values.filter(v => v.isActive);
        });
        setMasterValues(valuesMap);
      }
    } catch (error) { console.error('Error fetching master values:', error); }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoading(true);
    try {
      const uploadedImages = await uploadMultipleImages(files);
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch { toast.error('Failed to upload images.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to submit a custom order.'); navigate('/login'); return; }
    if (!formData.description.trim()) { toast.error('Please provide a description.'); return; }
    setLoading(true);
    try {
      const requestDetails = {
        sculptureType: formData.sculptureType, material: formData.material, size: formData.size,
        dimensions: { height: formData.height, width: formData.width, depth: formData.depth },
        color: formData.color, finish: formData.finish, description: formData.description,
        budget: formData.budget, timeline: formData.timeline, specialRequirements: formData.specialRequirements
      };
      const response = await apiCall('/auth/custom-order-requests', {
        method: 'POST',
        body: JSON.stringify({ requestDetails: JSON.stringify(requestDetails), images }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Custom order submitted!');
        setFormData({ sculptureType: '', material: '', size: '', height: '', width: '', depth: '', color: '', finish: '', description: '', budget: '', timeline: '', specialRequirements: '' });
        setImages([]);
        navigate('/profile');
      } else { toast.error(data.message || 'Failed to submit request'); }
    } catch { toast.error('An error occurred while submitting.'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-stone-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2 mb-4">
            <SparklesIcon className="h-4 w-4 text-violet-500" />
            <span className="text-violet-600 text-sm font-medium">Bespoke Sculptures</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Order Request</h1>
          <p className="text-gray-500">Tell us about your dream art piece! Provide details and reference images.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Information */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sculpture Type</label>
                <select value={formData.sculptureType} onChange={(e) => setFormData({ ...formData, sculptureType: e.target.value })} className={inputClass} required>
                  <option value="">Select Type</option>
                  {masterValues.sculpture_types?.map(t => <option key={t.value} value={t.label}>{t.label}</option>) || [
                    <option key="religious" value="Religious">Religious</option>,
                    <option key="abstract" value="Abstract">Abstract</option>,
                    <option key="portrait" value="Portrait">Portrait</option>,
                    <option key="animal" value="Animal">Animal</option>,
                    <option key="decorative" value="Decorative">Decorative</option>,
                    <option key="custom" value="Custom Design">Custom Design</option>
                  ]}
                </select>
              </div>
              <div>
                <label className={labelClass}>Material</label>
                <select value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className={inputClass} required>
                  <option value="">Select Material</option>
                  {masterValues.materials?.map(m => <option key={m.value} value={m.label}>{m.label}</option>) || [
                    <option key="marble" value="Marble">Marble</option>,
                    <option key="granite" value="Granite">Granite</option>,
                    <option key="sandstone" value="Sandstone">Sandstone</option>,
                    <option key="bronze" value="Bronze">Bronze</option>,
                    <option key="brass" value="Brass">Brass</option>,
                    <option key="wood" value="Wood">Wood</option>,
                    <option key="clay" value="Clay">Clay</option>,
                    <option key="other" value="Other">Other</option>
                  ]}
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Size Category</label>
                <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className={inputClass} required>
                  <option value="">Select Size</option>
                  <option value="Small (up to 12 inches)">Small (up to 12 inches)</option>
                  <option value="Medium (12-24 inches)">Medium (12-24 inches)</option>
                  <option value="Large (24-48 inches)">Large (24-48 inches)</option>
                  <option value="Extra Large (48+ inches)">Extra Large (48+ inches)</option>
                  <option value="Custom Size">Custom Size</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['height', 'H (in)'], ['width', 'W (in)'], ['depth', 'D (in)']].map(([field, placeholder]) => (
                  <div key={field}>
                    <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input type="number" value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className={inputClass} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Color Preference</label>
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={inputClass} placeholder="Natural stone, Black, White, Gold finish..." />
              </div>
              <div>
                <label className={labelClass}>Finish Type</label>
                <select value={formData.finish} onChange={(e) => setFormData({ ...formData, finish: e.target.value })} className={inputClass}>
                  <option value="">Select Finish</option>
                  {masterValues.finishes?.map(f => <option key={f.value} value={f.label}>{f.label}</option>) || [
                    <option key="polished" value="Polished">Polished</option>,
                    <option key="matte" value="Matte">Matte</option>,
                    <option key="textured" value="Textured">Textured</option>,
                    <option key="antique" value="Antique">Antique</option>,
                    <option key="natural" value="Natural">Natural</option>
                  ]}
                </select>
              </div>
            </div>
          </div>

          {/* Description & Budget */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
              Details & Budget
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className={labelClass}>Detailed Description <span className="text-red-400">*</span></label>
                <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="5" className={inputClass + " resize-y"}
                  placeholder="Describe your vision in detail. Include specific features, poses, expressions, or symbolic elements..." required disabled={loading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Budget Range</label>
                  <select value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className={inputClass}>
                    <option value="">Select Budget Range</option>
                    <option value="Under ₹10,000">Under ₹10,000</option>
                    <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                    <option value="Open to suggestions">Open to suggestions</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Timeline</label>
                  <select value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} className={inputClass}>
                    <option value="">Select Timeline</option>
                    <option value="Rush (2-4 weeks)">Rush (2-4 weeks)</option>
                    <option value="Standard (1-2 months)">Standard (1-2 months)</option>
                    <option value="Extended (2-3 months)">Extended (2-3 months)</option>
                    <option value="No rush (3+ months)">No rush (3+ months)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Special Requirements <span className="text-gray-400">(Optional)</span></label>
                <textarea value={formData.specialRequirements} onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  rows="3" className={inputClass + " resize-y"}
                  placeholder="Any special packaging, installation requirements, or other considerations..." disabled={loading} />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
              Reference Images <span className="text-gray-400 font-normal text-sm">(Optional)</span>
            </h3>
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-stone-50 hover:bg-violet-50 hover:border-violet-300 transition-all">
              <div className="flex flex-col items-center justify-center py-4">
                <PhotoIcon className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm text-gray-500"><span className="font-semibold text-violet-600">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (MAX 800×400px)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} multiple disabled={loading} />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold" disabled={loading}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className={`w-full px-6 py-4 rounded-2xl font-bold text-base transition-all ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:-translate-y-0.5'}`}>
            {loading ? 'Submitting...' : '✨ Submit Custom Order Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrder;
