import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { apiCall } from '../services/api';
import { 
  ChevronRightIcon, 
  UserIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  GiftIcon, 
  TrashIcon, 
  PencilIcon, 
  PlusIcon,
  StarIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const AddressModal = ({ address, isEditing, onClose, onSave }) => {
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setAddressFormData({
        fullName: address.fullName || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India',
        isDefault: address.isDefault || false,
      });
    } else {
      setAddressFormData({
        fullName: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({ ...addressFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(addressFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={addressFormData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={addressFormData.street}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={addressFormData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={addressFormData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-300 mb-2">PIN Code</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={addressFormData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={addressFormData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={addressFormData.isDefault}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-300">Set as default address</label>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bronze text-black rounded-lg hover:bg-gold transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAddresses(user.addresses || []);
      fetchLoyaltySettings();
      
      // Check for tab parameter in URL
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, [user, navigate, checkAuth, searchParams]);

  const fetchLoyaltySettings = async () => {
    try {
      const response = await apiCall('/settings/public');
      const data = await response.json();
      setLoyaltySettings(data.settings?.loyalty);
    } catch (error) {
      console.error('Error fetching loyalty settings:', error);
      toast.error('Failed to fetch loyalty settings');
    }
  };

  const handleRedeemPoints = async () => {
    if (pointsToRedeem <= 0) {
      toast.error('Please enter a valid number of points to redeem.');
      return;
    }
    if (user.loyaltyPoints < pointsToRedeem) {
      toast.error('Insufficient loyalty points.');
      return;
    }
    if (loyaltySettings && pointsToRedeem < loyaltySettings.minimumRedeemPoints) {
      toast.error(`Minimum ${loyaltySettings.minimumRedeemPoints} points required for redemption.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(
        '/auth/redeem-points',
        {
          method: 'POST',
          body: JSON.stringify({ pointsToRedeem }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(`Successfully redeemed ${pointsToRedeem} points for ₹${data.discountAmount} discount!`);
        await checkAuth();
        setPointsToRedeem(0);
      } else {
        toast.error(data.message || 'Failed to redeem points');
      }
    } catch (error) {
      console.error('Redeem points error:', error);
      toast.error('Failed to redeem points');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiCall(
        '/auth/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
          })
        }
      );
      if (response.ok) {
        toast.success('Profile updated successfully!');
        await checkAuth();
        setIsEditing(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (addressData) => {
    setIsLoading(true);
    try {
      let response;
      if (isEditingAddress && currentAddress) {
        response = await apiCall(
          `/auth/address/${currentAddress._id}`,
          {
            method: 'PUT',
            body: JSON.stringify(addressData)
          }
        );
      } else {
        response = await apiCall(
          '/auth/address',
          {
            method: 'POST',
            body: JSON.stringify(addressData)
          }
        );
      }
      
      if (response.ok) {
        toast.success(`Address ${isEditingAddress ? 'updated' : 'added'} successfully!`);
        await checkAuth();
        setShowAddressModal(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Save address error:', error);
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    setIsLoading(true);
    try {
      const response = await apiCall(
        `/auth/address/${addressId}`,
        {
          method: 'DELETE',
        }
      );
      if (response.ok) {
        toast.success('Address deleted successfully!');
        await checkAuth();
        setIsEditing(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setIsLoading(true);
    try {
      const response = await apiCall(
        `/auth/address/${addressId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ isDefault: true })
        }
      );
      if (response.ok) {
        toast.success('Default address set successfully!');
        await checkAuth();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Set default address error:', error);
      toast.error('Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const response = await apiCall('/auth/delete-account', {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Account deleted successfully!');
          logout();
          navigate('/signup');
        } else {
          const data = await response.json();
          toast.error(data.message || 'Failed to delete account');
        }
      } catch (error) {
        console.error('Delete account error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Link to="/login" className="bg-bronze text-black px-6 py-3 rounded-xl font-semibold hover:bg-gold transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center space-x-2 bg-bronze/20 px-4 py-2 rounded-xl">
            <StarIcon className="h-5 w-5 text-bronze" />
            <span className="text-bronze font-semibold">{user.loyaltyPoints || 0} Points</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-10 w-10 text-bronze" />
                </div>
                <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
              </div>
              
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Info', icon: UserIcon },
                  { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCardIcon },
                  { id: 'loyalty', label: 'Loyalty Points', icon: StarIcon },
                  { id: 'custom-orders', label: 'Custom Orders', icon: GiftIcon },
                  { id: 'delete', label: 'Delete Account', icon: TrashIcon }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id 
                          ? 'bg-bronze text-black' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <ProfileSection 
                user={user}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleUpdateProfile={handleUpdateProfile}
                isLoading={isLoading}
              />
            )}
            
            {activeTab === 'addresses' && (
              <AddressSection 
                addresses={user.addresses || []}
                setShowAddressModal={setShowAddressModal}
                setCurrentAddress={setCurrentAddress}
                setIsEditingAddress={setIsEditingAddress}
                handleDeleteAddress={handleDeleteAddress}
                handleSetDefaultAddress={handleSetDefaultAddress}
                isLoading={isLoading}
              />
            )}
            
            {activeTab === 'payment' && (
              <PaymentSection />
            )}
            
            {activeTab === 'loyalty' && (
              <LoyaltySection 
                user={user}
                loyaltySettings={loyaltySettings}
                pointsToRedeem={pointsToRedeem}
                setPointsToRedeem={setPointsToRedeem}
                handleRedeemPoints={handleRedeemPoints}
                isLoading={isLoading}
              />
            )}
            
            {activeTab === 'custom-orders' && (
              <CustomOrdersSection />
            )}
            
            {activeTab === 'delete' && (
              <DeleteAccountSection 
                handleDeleteAccount={handleDeleteAccount}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          address={currentAddress}
          isEditing={isEditingAddress}
          onClose={() => {
            setShowAddressModal(false);
            setCurrentAddress(null);
            setIsEditingAddress(false);
          }}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ user, formData, setFormData, isEditing, setIsEditing, handleUpdateProfile, isLoading }) => (
  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Profile Information</h2>
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center space-x-2 px-4 py-2 bg-bronze text-black rounded-xl hover:bg-gold transition-colors"
      >
        <PencilIcon className="h-4 w-4" />
        <span>{isEditing ? 'Cancel' : 'Edit'}</span>
      </button>
    </div>
    
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
          <input
            type="text"
            value={new Date(user.createdAt).toLocaleDateString()}
            disabled
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white opacity-50"
          />
        </div>
      </div>
      
      {isEditing && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-bronze text-black rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  </div>
);

// Address Section Component
const AddressSection = ({ addresses, setShowAddressModal, setCurrentAddress, setIsEditingAddress, handleDeleteAddress, handleSetDefaultAddress, isLoading }) => (
  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Addresses</h2>
      <button
        onClick={() => {
          setCurrentAddress(null);
          setIsEditingAddress(false);
          setShowAddressModal(true);
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-bronze text-black rounded-xl hover:bg-gold transition-colors"
      >
        <PlusIcon className="h-4 w-4" />
        <span>Add Address</span>
      </button>
    </div>
    
    {addresses.length === 0 ? (
      <div className="text-center py-8">
        <MapPinIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No addresses added yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-white font-semibold">{address.fullName}</h3>
                  {address.isDefault && (
                    <span className="bg-bronze text-black px-2 py-1 rounded-full text-xs font-medium">Default</span>
                  )}
                </div>
                <p className="text-gray-300">{address.street}</p>
                <p className="text-gray-300">{address.city}, {address.state} {address.pincode}</p>
                <p className="text-gray-300">{address.country}</p>
              </div>
              <div className="flex items-center space-x-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefaultAddress(address._id)}
                    disabled={isLoading}
                    className="text-bronze hover:text-gold transition-colors text-sm"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    setCurrentAddress(address);
                    setIsEditingAddress(true);
                    setShowAddressModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address._id)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Payment Section Component
const PaymentSection = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-bronze text-black rounded-xl hover:bg-gold transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Card</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* UPI Apps */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
            UPI Apps
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
              <button key={app} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-center transition-colors">
                <span className="text-white text-sm">{app}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Saved Cards */}
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payment methods added yet</p>
          </div>
        ) : (
          paymentMethods.map((method, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              {/* Payment method details */}
            </div>
          ))
        )}
      </div>
      
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Payment Method</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                value={cardForm.number}
                onChange={(e) => setCardForm({...cardForm, number: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardForm.name}
                onChange={(e) => setCardForm({...cardForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-bronze text-black rounded-xl hover:bg-gold"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Loyalty Section Component
const LoyaltySection = ({ user, loyaltySettings, pointsToRedeem, setPointsToRedeem, handleRedeemPoints, isLoading }) => (
  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
    <h2 className="text-2xl font-bold text-white mb-6">Loyalty Program</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gradient-to-r from-bronze to-gold rounded-xl p-6 text-black">
        <h3 className="text-xl font-bold mb-2">Available Points</h3>
        <p className="text-3xl font-bold">{user.loyaltyPoints || 0}</p>
        <p className="text-sm opacity-80">Earn 1 point per ₹10 spent</p>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Redeem Points</h3>
        <div className="space-y-4">
          <input
            type="number"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
            placeholder="Points to redeem"
            min={loyaltySettings?.minimumRedeemPoints || 100}
            max={user.loyaltyPoints || 0}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
          />
          <button
            onClick={handleRedeemPoints}
            disabled={isLoading || pointsToRedeem <= 0}
            className="w-full px-4 py-3 bg-bronze text-black rounded-xl hover:bg-gold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Redeeming...' : 'Redeem Points'}
          </button>
        </div>
        {loyaltySettings && (
          <p className="text-gray-400 text-sm mt-2">
            Minimum: {loyaltySettings.minimumRedeemPoints} points
          </p>
        )}
      </div>
    </div>
    
    <div className="bg-gray-800 rounded-xl p-4">
      <h4 className="text-white font-semibold mb-2">How it works:</h4>
      <ul className="text-gray-300 text-sm space-y-1">
        <li>• Earn 1 point for every ₹10 spent</li>
        <li>• Redeem points for discounts on future orders</li>
        <li>• 1 point = ₹1 discount</li>
        <li>• Points never expire</li>
      </ul>
    </div>
  </div>
);

// Custom Orders Section Component
const CustomOrdersSection = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCustomOrders();
  }, []);
  
  const fetchCustomOrders = async () => {
    try {
      const response = await apiCall('/auth/custom-order-requests');
      const data = await response.json();
      if (response.ok) {
        setCustomOrders(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching custom orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const parseRequestDetails = (requestDetails) => {
    try {
      return JSON.parse(requestDetails);
    } catch {
      return { description: requestDetails };
    }
  };
  
  const filteredOrders = customOrders.filter(order => {
    const details = parseRequestDetails(order.requestDetails);
    const searchText = typeof details === 'object' 
      ? Object.values(details).join(' ').toLowerCase()
      : order.requestDetails.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Custom Orders</h2>
        <button
          onClick={() => navigate('/custom-order')}
          className="flex items-center space-x-2 px-4 py-2 bg-bronze text-black rounded-xl hover:bg-gold transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search custom orders..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-bronze focus:outline-none"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <GiftIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No custom orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const details = parseRequestDetails(order.requestDetails);
            return (
              <div key={order._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                        order.status === 'quoted' ? 'bg-blue-900/20 text-blue-400' :
                        order.status === 'accepted' ? 'bg-green-900/20 text-green-400' :
                        order.status === 'rejected' ? 'bg-red-900/20 text-red-400' :
                        'bg-gray-900/20 text-gray-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {typeof details === 'object' && details.sculptureType ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {details.sculptureType && (
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <span className="text-white ml-2">{details.sculptureType}</span>
                            </div>
                          )}
                          {details.material && (
                            <div>
                              <span className="text-gray-400">Material:</span>
                              <span className="text-white ml-2">{details.material}</span>
                            </div>
                          )}
                          {details.size && (
                            <div>
                              <span className="text-gray-400">Size:</span>
                              <span className="text-white ml-2">{details.size}</span>
                            </div>
                          )}
                          {details.finish && (
                            <div>
                              <span className="text-gray-400">Finish:</span>
                              <span className="text-white ml-2">{details.finish}</span>
                            </div>
                          )}
                          {details.budget && (
                            <div>
                              <span className="text-gray-400">Budget:</span>
                              <span className="text-white ml-2">{details.budget}</span>
                            </div>
                          )}
                          {details.timeline && (
                            <div>
                              <span className="text-gray-400">Timeline:</span>
                              <span className="text-white ml-2">{details.timeline}</span>
                            </div>
                          )}
                        </div>
                        
                        {details.dimensions && (details.dimensions.height || details.dimensions.width || details.dimensions.depth) && (
                          <div className="text-sm">
                            <span className="text-gray-400">Dimensions:</span>
                            <span className="text-white ml-2">
                              {details.dimensions.height && `${details.dimensions.height}H`}
                              {details.dimensions.width && ` × ${details.dimensions.width}W`}
                              {details.dimensions.depth && ` × ${details.dimensions.depth}D`}
                              {' inches'}
                            </span>
                          </div>
                        )}
                        
                        {details.color && (
                          <div className="text-sm">
                            <span className="text-gray-400">Color:</span>
                            <span className="text-white ml-2">{details.color}</span>
                          </div>
                        )}
                        
                        {details.description && (
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Description:</p>
                            <p className="text-gray-300 text-sm">{details.description}</p>
                          </div>
                        )}
                        
                        {details.specialRequirements && (
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Special Requirements:</p>
                            <p className="text-gray-300 text-sm">{details.specialRequirements}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-medium mb-2">Request Details:</p>
                        <p className="text-gray-300 text-sm">{order.requestDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {order.quotedPrice && (
                  <div className="bg-gray-700 rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Quoted Price:</span>
                      <span className="text-bronze font-bold text-lg">₹{order.quotedPrice.toLocaleString()}</span>
                    </div>
                    {order.estimatedDeliveryDate && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-300">Estimated Delivery:</span>
                        <span className="text-gray-300">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {order.adminNotes && (
                  <div className="mt-3 p-3 bg-blue-900/20 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium mb-1">Admin Notes:</p>
                    <p className="text-blue-300 text-sm">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Delete Account Section Component
const DeleteAccountSection = ({ handleDeleteAccount, isLoading }) => (
  <div className="bg-gray-900 rounded-2xl p-6 border border-red-500/30">
    <h2 className="text-2xl font-bold text-red-400 mb-6">Delete Account</h2>
    
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
      <h3 className="text-red-400 font-semibold mb-2">Warning!</h3>
      <p className="text-red-300 text-sm mb-4">
        This action cannot be undone. Deleting your account will:
      </p>
      <ul className="text-red-300 text-sm space-y-1 mb-4">
        <li>• Permanently delete your profile and personal information</li>
        <li>• Remove all your addresses and payment methods</li>
        <li>• Delete your order history and custom order requests</li>
        <li>• Forfeit all loyalty points</li>
        <li>• Cancel any pending orders</li>
      </ul>
    </div>
    
    <button
      onClick={handleDeleteAccount}
      disabled={isLoading}
      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Deleting...' : 'Delete My Account'}
    </button>
  </div>
);

export default UserProfile;