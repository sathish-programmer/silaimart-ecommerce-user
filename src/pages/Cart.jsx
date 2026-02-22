import { Link } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Add some divine sculptures to your cart</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
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
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
          </div>
          <button onClick={clearCart} className="text-secondary-500 hover:text-secondary-600 text-sm font-medium transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-card border border-gray-100">
                <div className="w-20 h-20 flex-shrink-0 bg-violet-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {item.product.images?.[0]?.url ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <ShoppingBagIcon className="h-8 w-8 text-violet-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product._id}`} className="text-gray-900 font-semibold hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                    {item.product.name}
                  </Link>
                  {item.product.category?.name && (
                    <p className="text-gray-400 text-xs mt-0.5">{item.product.category.name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary-600 font-bold text-sm">
                      ₹{(item.product.discountPrice || item.product.price)?.toLocaleString()}
                    </span>
                    {item.product.discountPrice && (
                      <span className="text-gray-400 line-through text-xs">₹{item.product.price?.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-gray-900 font-semibold text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-gray-900 font-bold text-sm">
                    ₹{((item.product.discountPrice || item.product.price) * item.quantity)?.toLocaleString()}
                  </p>
                </div>

                <button onClick={() => removeItem(item.product._id)} className="p-2 text-gray-300 hover:text-secondary-500 transition-colors rounded-xl hover:bg-secondary-50">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600 text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {subtotal < 1000 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 flex items-center gap-2">
                  <TruckIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-700 text-xs font-medium">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for <span className="font-bold">FREE shipping!</span>
                  </p>
                </div>
              )}

              <Link to="/checkout" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold text-center block mt-5 transition-all duration-200 shadow-sm hover:shadow-md">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="w-full mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium text-center block transition-all duration-200">
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