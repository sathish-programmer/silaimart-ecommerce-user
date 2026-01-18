// Simple image upload utility
// For production, you should use Cloudinary or AWS S3

export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    // Create a simple base64 data URL for demo purposes
    // In production, replace this with actual cloud upload
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve({
        url: reader.result,
        public_id: `custom_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const uploadMultipleImages = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};