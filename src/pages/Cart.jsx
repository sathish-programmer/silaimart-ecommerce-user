import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TruckIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cartStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings/public`);
        setSettings(res.data?.settings);
      } catch (err) { console.error(err); }
    };
    fetchSettings();
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-violet-400" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some premium products to your cart</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const mrpTotal = items.reduce((s, i) => s + (i.product.price || i.product.discountPrice || 0) * i.quantity, 0);
  const mrpDiscount = mrpTotal - subtotal;
  const shipping = subtotal >= 1000 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const wowDiscount = settings?.offers?.wowDeal?.enabled ? Math.round(subtotal * (settings.offers.wowDeal.discountPercentage || 15) / 100) : 0;
  const total = subtotal + shipping + tax - wowDiscount;

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
          </div>
          <button onClick={clearCart} className="text-secondary-500 hover:text-secondary-600 text-sm font-medium transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const itemPrice = item.product.discountPrice || item.product.price;
              const itemOrigPrice = item.product.price || itemPrice;
              const itemDiscountPct = itemOrigPrice > itemPrice ? Math.round(((itemOrigPrice - itemPrice) / itemOrigPrice) * 100) : 0;
              const itemWowPrice = settings?.offers?.wowDeal?.enabled ? Math.round(itemPrice * (1 - (settings.offers.wowDeal.discountPercentage || 15) / 100)) : itemPrice;
              const superCoinDiscount = settings?.offers?.superCoin?.enabled ? settings.offers.superCoin.pointsDiscount : 0;

              return (
                <div key={item.product._id} className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-card border border-gray-100">
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

                  <div className="flex-1 min-w-0 w-full">
                    <Link to={`/product/${item.product._id}`} className="text-gray-900 font-semibold hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                      {item.product.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.product.category?.name && (
                        <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">{item.product.category.name}</span>
                      )}
                      {item.size && (
                        <span className="text-stone-900 text-[10px] font-black bg-stone-100 px-2 py-0.5 rounded-md uppercase tracking-widest">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                          <span className="text-stone-900 text-[10px] font-black uppercase tracking-widest">Color: {item.color}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary-600 font-black text-sm">
                        ₹{itemPrice.toLocaleString()}
                      </span>
                      {itemOrigPrice > itemPrice && (
                        <>
                          <span className="text-gray-400 line-through text-[10px] font-bold">₹{itemOrigPrice.toLocaleString()}</span>
                          <span className="text-emerald-600 text-[10px] font-black tracking-wider">↓{itemDiscountPct}%</span>
                        </>
                      )}
                    </div>

                    {/* Flipkart Style Wow Deal & SuperCoin Tags */}
                    {settings?.offers && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        {settings.offers.wowDeal?.enabled && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                            <SparklesIcon className="h-3 w-3 text-blue-600" />
                            WOW! Buy at ₹{itemWowPrice.toLocaleString()}
                          </span>
                        )}
                        {settings.offers.superCoin?.enabled && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-100">
                            🪙 Or Pay ₹{Math.max(0, itemPrice - superCoinDiscount).toLocaleString()} + {settings.offers.superCoin.coinsRequired} Coins
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controls & Price */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size, item.color)} 
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-gray-900 font-black text-xs w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size, item.color)} 
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-900 font-black text-sm">
                        ₹{(itemPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <button 
                      onClick={() => removeItem(item.product._id, item.size, item.color)} 
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Price Details</h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{mrpTotal.toLocaleString()}</span>
                </div>
                {mrpDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount on MRP</span>
                    <span>-₹{mrpDiscount.toLocaleString()}</span>
                  </div>
                )}
                {wowDiscount > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>WOW! Deal Applied</span>
                    <span>-₹{wowDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-gray-900 text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary-600">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Flipkart Green Savings Banner */}
              {(mrpDiscount + wowDiscount) > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-center gap-2 text-emerald-700 font-black text-xs shadow-sm">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>You'll save ₹{(mrpDiscount + wowDiscount).toLocaleString()} on this order!</span>
                </div>
              )}

              {subtotal < 1000 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <TruckIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-700 text-xs font-medium">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for <span className="font-bold">FREE shipping!</span>
                  </p>
                </div>
              )}

              <Link to="/checkout" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-black text-center block transition-all duration-200 shadow-lg shadow-primary-200 active:scale-[0.98] uppercase tracking-wider text-xs">
                Place Order
              </Link>
              <Link to="/shop" className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-center block transition-all duration-200 text-xs uppercase tracking-wider">
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