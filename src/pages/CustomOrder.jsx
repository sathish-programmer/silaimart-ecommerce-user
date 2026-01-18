import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { uploadMultipleImages } from '../utils/imageUpload';

const CustomOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [masterValues, setMasterValues] = useState({});
  const [formData, setFormData] = useState({
    sculptureType: '',
    material: '',
    size: '',
    height: '',
    width: '',
    depth: '',
    color: '',
    finish: '',
    description: '',
    budget: '',
    timeline: '',
    specialRequirements: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMasterValues();
  }, []);

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
    } catch (error) {
      console.error('Error fetching master values:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadedImages = await uploadMultipleImages(files);
      setImages(prevImages => [...prevImages, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a custom order request.');
      navigate('/login');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description for your custom order.');
      return;
    }

    setLoading(true);
    try {
      const requestDetails = {
        sculptureType: formData.sculptureType,
        material: formData.material,
        size: formData.size,
        dimensions: {
          height: formData.height,
          width: formData.width,
          depth: formData.depth
        },
        color: formData.color,
        finish: formData.finish,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        specialRequirements: formData.specialRequirements
      };

      const response = await apiCall('/auth/custom-order-requests', {
        method: 'POST',
        body: JSON.stringify({ requestDetails: JSON.stringify(requestDetails), images }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Custom order request submitted!');
        setFormData({
          sculptureType: '',
          material: '',
          size: '',
          height: '',
          width: '',
          depth: '',
          color: '',
          finish: '',
          description: '',
          budget: '',
          timeline: '',
          specialRequirements: ''
        });
        setImages([]);
        navigate('/profile');
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting custom order request:', error);
      toast.error('An error occurred while submitting your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white text-center">Custom Order Request</h1>
        <p className="text-gray-400 text-center mb-6">Tell us about your dream art piece! Provide as much detail as possible, and you can even upload reference images.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sculpture Type</label>
                <select
                  value={formData.sculptureType}
                  onChange={(e) => setFormData({...formData, sculptureType: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="">Select Type</option>
                  {masterValues.sculpture_types?.map(type => (
                    <option key={type.value} value={type.label}>{type.label}</option>
                  )) || [
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Material</label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="">Select Material</option>
                  {masterValues.materials?.map(material => (
                    <option key={material.value} value={material.label}>{material.label}</option>
                  )) || [
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
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Size Category</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="">Select Size</option>
                  <option value="Small (up to 12 inches)">Small (up to 12 inches)</option>
                  <option value="Medium (12-24 inches)">Medium (12-24 inches)</option>
                  <option value="Large (24-48 inches)">Large (24-48 inches)</option>
                  <option value="Extra Large (48+ inches)">Extra Large (48+ inches)</option>
                  <option value="Custom Size">Custom Size</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (inches)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                    placeholder="H"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Width (inches)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                    placeholder="W"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Depth (inches)</label>
                  <input
                    type="number"
                    value={formData.depth}
                    onChange={(e) => setFormData({...formData, depth: e.target.value})}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                    placeholder="D"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color Preference</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                  placeholder="e.g., Natural stone, Black, White, Gold finish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Finish Type</label>
                <select
                  value={formData.finish}
                  onChange={(e) => setFormData({...formData, finish: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-bronze focus:outline-none"
                >
                  <option value="">Select Finish</option>
                  {masterValues.finishes?.map(finish => (
                    <option key={finish.value} value={finish.label}>{finish.label}</option>
                  )) || [
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Detailed Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="6"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 resize-y"
              placeholder="Describe your vision in detail. Include any specific features, poses, expressions, or symbolic elements you want..."
              required
              disabled={loading}
            ></textarea>
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
              >
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
              >
                <option value="">Select Timeline</option>
                <option value="Rush (2-4 weeks)">Rush (2-4 weeks)</option>
                <option value="Standard (1-2 months)">Standard (1-2 months)</option>
                <option value="Extended (2-3 months)">Extended (2-3 months)</option>
                <option value="No rush (3+ months)">No rush (3+ months)</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements (Optional)</label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none resize-y"
              placeholder="Any special packaging, installation requirements, or other considerations..."
              disabled={loading}
            ></textarea>
          </div>

          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300 mb-2">Upload Reference Images (Optional):</label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG, GIF (MAX. 800x400px)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} multiple disabled={loading} />
              </label>
            </div>
            <div className="flex flex-wrap mt-4 space-x-2">
              {images.map((img, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                  <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg text-black font-semibold transition-colors ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-bronze hover:bg-gold'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Custom Order Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrder;
