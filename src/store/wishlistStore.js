import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      loading: false,

      // Fetch wishlist from server
      fetchWishlist: async () => {
        try {
          set({ loading: true });
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await axios.get(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ wishlist: response.data.wishlist.products || [] });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      // Add product to wishlist
      addToWishlist: async (product) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Please login to add items to wishlist');
            return;
          }

          const response = await axios.post(`${API_URL}/wishlist`, {
            productId: product._id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ wishlist: response.data.wishlist.products });
          toast.success('Added to wishlist');
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
      },

      // Remove product from wishlist
      removeFromWishlist: async (productId) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ wishlist: response.data.wishlist.products });
          toast.success('Removed from wishlist');
        } catch (error) {
          toast.error('Failed to remove from wishlist');
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(item => item._id === productId);
      },

      // Clear entire wishlist
      clearWishlist: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          await axios.delete(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ wishlist: [] });
          toast.success('Wishlist cleared');
        } catch (error) {
          toast.error('Failed to clear wishlist');
        }
      },

      // Get wishlist count
      getWishlistCount: () => {
        const { wishlist } = get();
        return wishlist.length;
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ wishlist: state.wishlist })
    }
  )
);