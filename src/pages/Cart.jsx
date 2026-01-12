import { Link } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8">Add some divine sculptures to your cart</p>
          <Link 
            to="/shop" 
            className="bg-bronze text-black px-8 py-3 rounded-lg font-semibold hover:bg-gold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal >= 1000 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="bg-gray-900 rounded-lg p-6 flex items-center space-x-4">
                <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.product.images?.[0]?.url ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full flex-col items-center justify-center p-2 text-center">
                    <span className="text-bronze font-bold text-xs leading-tight break-words">{item.product.name}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <Link 
                    to={`/product/${item.product._id}`}
                    className="text-white font-semibold hover:text-bronze transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-400 text-sm mt-1">{item.product.category?.name}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-bronze font-bold">
                      ₹{item.product.discountPrice || item.product.price}
                    </span>
                    {item.product.discountPrice && (
                      <span className="text-gray-500 line-through text-sm">
                        ₹{item.product.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-white font-bold">
                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-3">
                  <span>Total</span>
                  <span className="text-bronze">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {subtotal < 1000 && (
                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 my-6">
                  <p className="text-blue-300 text-sm">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for free shipping!
                  </p>
                </div>
              )}
              
              <Link
                to="/checkout"
                className="w-full bg-bronze text-black py-3 rounded-lg font-semibold hover:bg-gold transition-colors mt-6 block text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/shop"
                className="w-full mt-3 border border-bronze text-bronze py-3 rounded-lg font-semibold hover:bg-bronze hover:text-black transition-colors block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;