import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1, size = '', color = '') => {
        const items = get().items;
        const existingItemIndex = items.findIndex(item => 
          item.product._id === product._id && 
          item.size === size && 
          item.color === color
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity
          };
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, quantity, size, color }] });
        }
      },
      
      removeItem: (productId, size = '', color = '') => {
        set({ 
          items: get().items.filter(item => 
            !(item.product._id === productId && item.size === size && item.color === color)
          ) 
        });
      },
      
      updateQuantity: (productId, quantity, size = '', color = '') => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        
        set({
          items: get().items.map(item =>
            (item.product._id === productId && item.size === size && item.color === color)
              ? { ...item, quantity } 
              : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    { name: 'cart-storage' }
  )
);