import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
  TruckIcon,
  ArrowPathIcon,
  TagIcon,
  ScissorsIcon,
  StarIcon,
  HomeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SUGGESTED_PROMPTS = [
  { text: '🕉️ Sacred Products', action: 'Show me your sculptures' },
  { text: '🚚 Track Order', action: 'redirect:/orders' },
  { text: '💎 Our Materials', action: 'What materials do you use?' },
  { text: '💰 Great Deals', action: 'Show me current offers and discounts' },
  { text: '🎨 Design Stories', action: 'Tell me about your artisan craftsmanship' },
  { text: '🔄 Return Policy', action: 'What is your return policy?' },
  { text: '💬 Support Info', action: 'I need help with my order' },
  { text: '❤️ Wishlist', action: 'redirect:/wishlist' },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  const [botConfig, setBotConfig] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchBotConfig(); }, []);
  useEffect(() => { if (isOpen && messages.length === 0) initializeChat(); }, [isOpen]);
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/config`);
      setBotConfig(response.data.bot);
    } catch (error) { console.error('Error fetching bot config:', error); }
  };

  const initializeChat = () => {
    const welcome = {
      sender: 'bot',
      message: botConfig?.welcomeMessage || `Hi${user ? ' ' + user.name?.split(' ')[0] : ''}! 👋 I'm your SilaiMart AI assistant. I can help you find products, track orders, get sizing advice, or answer any questions about our tailoring services. How can I help you today?`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcome]);
    setShowSuggestions(true);
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const sendMessage = async (messageText) => {
    const text = messageText || inputMessage;
    if (!text.trim()) return;
    setShowSuggestions(false);
    const userMessage = { sender: 'user', message: text, timestamp: new Date(), type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    try {
      const response = await axios.post(`${API_URL}/chatbot/message`, {
        sessionId, message: text, userId: user?._id
      });
      setTimeout(() => {
        const botMessage = {
          sender: 'bot',
          message: response.data.response.message,
          timestamp: new Date(),
          type: response.data.response.type,
          data: response.data.response.data
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 600);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        message: "I'm having trouble connecting right now. Please try again in a moment, or contact us at silaimartindia@gmail.com 🙏",
        timestamp: new Date(), type: 'text'
      }]);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.startsWith('redirect:')) {
      navigate(action.replace('redirect:', ''));
      if (window.innerWidth < 768) setIsOpen(false);
      return;
    }
    sendMessage(action);
  };

  const handleReset = () => {
    setMessages([]);
    setShowSuggestions(true);
    setTimeout(() => initializeChat(), 50);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            className="fixed bottom-6 right-6 z-50 group"
          >
            {/* Tooltip */}
            <div className="absolute -top-14 right-0 min-w-max bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-sm font-medium">
              Chat with SilaiMart AI ✨
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-gray-900 transform rotate-45" />
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="relative bg-gradient-to-br from-violet-600 to-purple-700 text-white p-4 rounded-2xl shadow-xl shadow-violet-400/40 hover:shadow-violet-400/60 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5"
            >
              <SparklesIcon className="h-6 w-6" />
              <span className="text-sm font-semibold pr-1 hidden sm:block">AI Chat</span>
              {/* Online pulse */}
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 border-2 border-violet-700 rounded-full animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">

              {/* ── Header ── */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-violet-700 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">{botConfig?.name || 'SilaiMart AI'}</h3>
                    <p className="text-violet-200 text-xs flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                      Online · Typically replies instantly
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleReset}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
                    title="New Conversation">
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)}
                    className="p-2 text-white/70 hover:text-white hover:bg-red-400/30 rounded-xl transition-colors">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Messages Area ── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                {messages.map((message, index) => (
                  <div key={index} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[88%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Bot avatar */}
                      {message.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center flex-shrink-0 mb-1">
                          <SparklesIcon className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                      )}
                      {/* Bubble */}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${message.sender === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] text-gray-400 mt-1 ${message.sender === 'user' ? 'mr-1' : 'ml-9'}`}>
                      {formatTime(message.timestamp)}
                    </div>

                    {/* Product Cards */}
                    {message.sender === 'bot' && message.type === 'product' && message.data?.products && (
                      <div className="ml-9 mt-2 w-[90%] space-y-3">
                        {message.data.products.map((product, idx) => (
                          <div key={idx}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col sm:flex-row"
                            onClick={() => navigate(`/product/${product._id}`)}>
                            <div className="w-full sm:w-20 h-24 sm:h-20 bg-stone-50 flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-violet-100">
                                  <ShoppingBagIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                              <h4 className="text-gray-900 text-[11px] font-black uppercase tracking-wider truncate mb-1">{product.name}</h4>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-primary-600 font-bold text-sm">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                                  {product.discountPrice && (
                                    <span className="text-gray-400 text-[10px] line-through">₹{product.price.toLocaleString()}</span>
                                  )}
                                </div>
                                <span className="text-[9px] font-black text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  EXPLORE <span className="text-xs">→</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {message.data.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.data.suggestions.map((s, idx) => (
                              <button key={idx} onClick={() => sendMessage(s)}
                                className="text-[10px] bg-white hover:bg-primary-600 hover:text-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-100 hover:border-primary-600 transition-all font-bold shadow-sm">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Replies from bot */}
                    {message.sender === 'bot' && message.data?.quickReplies && (
                      <div className="ml-9 mt-2 flex flex-wrap gap-2">
                        {message.data.quickReplies.map((reply, idx) => (
                          <button key={idx} onClick={() => handleQuickAction(reply.action)}
                            className="bg-white hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm">
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step-by-step */}
                    {message.sender === 'bot' && message.data?.steps && (
                      <div className="ml-9 mt-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm w-[88%]">
                        {message.data.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                            <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{idx + 1}</div>
                            <p className="text-gray-700 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
                      <SparklesIcon className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Suggested Prompts ── */}
              {showSuggestions && messages.length <= 1 && (
                <div className="px-4 pt-2 pb-0 bg-white border-t border-gray-50 flex-shrink-0">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Quick Actions</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button key={i} onClick={() => handleQuickAction(prompt.action)}
                        className="flex-shrink-0 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 hover:border-violet-300 text-xs font-medium px-3 py-2 rounded-xl transition-all whitespace-nowrap">
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input Area ── */}
              <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center bg-stone-50 border border-gray-200 rounded-2xl focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all overflow-hidden">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask me anything about SilaiMart..."
                    className="flex-1 bg-transparent border-none text-gray-800 placeholder-gray-400 text-sm focus:ring-0 px-4 py-3"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="m-1.5 p-2.5 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl text-white shadow-md hover:shadow-violet-300/60 disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
                  Powered by <span className="text-violet-500">SilaiMart AI</span> · Always here to help
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;