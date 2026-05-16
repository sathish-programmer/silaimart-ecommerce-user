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
    productType: '', material: '', size: '', height: '', width: '', depth: '',
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
        // The API returns masterValues as an object with categories as keys
        // or as an array depending on the exact response structure.
        // Based on masterValuesController, it's result[mv.category]
        const rawValues = data.masterValues || {};
        setMasterValues(rawValues);
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
    if (!user) { toast.error('Please login to submit a custom request.'); navigate('/login'); return; }
    if (!formData.description.trim()) { toast.error('Please provide a description.'); return; }
    setLoading(true);
    try {
      const requestDetails = {
        productType: formData.productType, material: formData.material, size: formData.size,
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
        toast.success(data.message || 'Custom request submitted!');
        setFormData({ productType: '', material: '', size: '', height: '', width: '', depth: '', color: '', finish: '', description: '', budget: '', timeline: '', specialRequirements: '' });
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
            <span className="text-violet-600 text-sm font-medium">Bespoke Requests</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Request Form</h1>
          <p className="text-gray-500">Tell us about your requirements! Provide details and reference images.</p>
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
                <label className={labelClass}>Product Category/Type</label>
                <select value={formData.productType} onChange={(e) => setFormData({ ...formData, productType: e.target.value })} className={inputClass} required>
                  <option value="">Select Type</option>
                  {(masterValues.product_types || masterValues.sculpture_types)?.map(t => <option key={t._id || t.value} value={t.label || t}>{t.label || t}</option>) || [
                    <option key="decorative" value="Decorative">Decorative</option>,
                    <option key="furniture" value="Furniture">Furniture</option>,
                    <option key="jewelry" value="Jewelry">Jewelry</option>,
                    <option key="art" value="Art/Sculpture">Art/Sculpture</option>,
                    <option key="custom" value="Custom Design">Custom Design</option>
                  ]}
                </select>
              </div>
              <div>
                <label className={labelClass}>Material Preference</label>
                <select value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className={inputClass} required>
                  <option value="">Select Material</option>
                  {masterValues.materials?.map(m => <option key={m._id || m.value} value={m.label || m}>{m.label || m}</option>) || [
                    <option key="wood" value="Wood">Wood</option>,
                    <option key="metal" value="Metal">Metal</option>,
                    <option key="stone" value="Stone">Stone</option>,
                    <option key="glass" value="Glass">Glass</option>,
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
              Dimensions & Scale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Size Category</label>
                <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className={inputClass} required>
                  <option value="">Select Size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                  <option value="Custom Size">Custom Size</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['height', 'H (cm)'], ['width', 'W (cm)'], ['depth', 'D (cm)']].map(([field, placeholder]) => (
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
              Appearance & Style
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Color Preference</label>
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={inputClass} placeholder="e.g. Natural, Gold, White..." />
              </div>
              <div>
                <label className={labelClass}>Finish Type</label>
                <select value={formData.finish} onChange={(e) => setFormData({ ...formData, finish: e.target.value })} className={inputClass}>
                  <option value="">Select Finish</option>
                  {masterValues.finishes?.map(f => <option key={f._id || f.value} value={f.label || f}>{f.label || f}</option>) || [
                    <option key="polished" value="Polished">Polished</option>,
                    <option key="matte" value="Matte">Matte</option>,
                    <option key="textured" value="Textured">Textured</option>,
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
                  placeholder="Describe your vision in detail. Include specific features, design elements, or any particular requirements..." required disabled={loading} />
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
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Timeline</label>
                  <select value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} className={inputClass}>
                    <option value="">Select Timeline</option>
                    <option value="Rush (2-4 weeks)">Rush (2-4 weeks)</option>
                    <option value="Standard (1-2 months)">Standard (1-2 months)</option>
                    <option value="Extended (2-3 months)">Extended (2-3 months)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Special Instructions <span className="text-gray-400">(Optional)</span></label>
                <textarea value={formData.specialRequirements} onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  rows="3" className={inputClass + " resize-y"}
                  placeholder="Any special considerations or requests..." disabled={loading} />
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
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max 5MB per file)</p>
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
            className={`w-full px-6 py-4 rounded-2xl font-bold text-base transition-all ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-stone-900 text-white shadow-xl hover:bg-black hover:-translate-y-0.5 active:scale-[0.98]'}`}>
            {loading ? 'Submitting...' : 'Submit Custom Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrder;
