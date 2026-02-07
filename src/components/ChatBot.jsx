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
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  const [botConfig, setBotConfig] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBotConfig();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/config`);
      setBotConfig(response.data.bot);
    } catch (error) {
      console.error('Error fetching bot config:', error);
    }
  };

  const initializeChat = () => {
    if (botConfig?.welcomeMessage) {
      setMessages([{
        sender: 'bot',
        message: botConfig.welcomeMessage,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      sender: 'user',
      message: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot/message`, {
        sessionId,
        message: inputMessage,
        userId: user?._id
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
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.startsWith('redirect:')) {
      const url = action.replace('redirect:', '');
      navigate(url);
      if (window.innerWidth < 768) setIsOpen(false); // Only close on mobile
      return;
    }
    setInputMessage(action);
    setTimeout(() => sendMessage(), 100);
  };

  const quickActions = [
    { label: 'Show Products', action: 'Show me your sculptures', icon: ShoppingBagIcon },
    { label: 'Track Order', action: 'redirect:/track-order', icon: TruckIcon },
    { label: 'Help & Support', action: 'I need help', icon: QuestionMarkCircleIcon }
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="absolute -top-12 right-0 bg-white text-black px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap font-medium text-sm">
              Need help? Chat with us!
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white transform rotate-45"></div>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-bronze to-amber-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(205,127,50,0.3)] hover:shadow-[0_0_30px_rgba(205,127,50,0.5)] transition-all duration-500 transform hover:scale-110 active:scale-95 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full"></div>
              <ChatBubbleLeftRightIcon className="h-7 w-7 relative z-10" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-amber-600 rounded-full animate-pulse"></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
          >
            <div
              className="bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 w-[380px] h-[600px] flex flex-col overflow-hidden"
            >
              {/* Modern Header */}
              <div className="bg-gradient-to-r from-gray-900/90 to-black/90 p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-bronze/10 to-transparent"></div>

                <div className="flex items-center space-x-3 relative z-10">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bronze to-amber-800 p-[2px] shadow-lg shadow-bronze/20">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-bronze animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                      {botConfig?.name || 'SilaiMart AI'}
                      {/* <span className="px-1.5 py-0.5 rounded text-[10px] bg-bronze/20 text-bronze border border-bronze/20 font-medium">BOT</span> */}
                    </h3>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-500"></span>
                      Online & Ready to Help
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 relative z-10">
                  <button
                    onClick={() => {
                      setMessages([]);
                      initializeChat();
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Reset Chat"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex items-end gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar for Bot */}
                      {message.sender === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <SparklesIcon className="w-3 h-3 text-bronze" />
                        </div>
                      )}

                      <div className={`
                          p-4 rounded-2xl shadow-sm text-sm leading-relaxed relative group
                          ${message.sender === 'user'
                          ? 'bg-gradient-to-br from-bronze to-amber-700 text-white rounded-br-sm shadow-lg shadow-bronze/5 border border-white/10'
                          : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 rounded-bl-sm hover:bg-white/10 transition-colors'
                        }
                        `}>
                        <p>{message.message}</p>
                      </div>
                    </div>

                    <div className={`text-[10px] text-gray-500 mt-1 px-1 flex items-center gap-1 ${message.sender === 'user' ? 'mr-1' : 'ml-9'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Rich Content Renderers */}
                    {message.sender === 'bot' && message.type === 'product' && message.data?.products && (
                      <div className="ml-8 mt-3 w-[85%] space-y-3">
                        {message.data.products.map((product, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-3 flex gap-3 border border-white/10 hover:border-bronze/50 transition-all cursor-pointer group shadow-lg"
                            onClick={() => window.open(`/product/${product._id}`, '_blank')}>
                            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                              {product.images?.[0] ? (
                                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <ShoppingBagIcon className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="text-gray-200 text-sm font-medium truncate group-hover:text-bronze transition-colors">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-bronze font-bold text-sm">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                                {product.discountPrice && (
                                  <span className="text-gray-600 text-xs line-through">₹{product.price.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {message.data.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.data.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickAction(suggestion)}
                                className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-white/5 transition-all"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions / Buttons */}
                    {message.sender === 'bot' && message.data?.quickReplies && (
                      <div className="ml-8 mt-2 flex flex-wrap gap-2">
                        {message.data.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(reply.action)}
                            className="bg-transparent hover:bg-bronze/20 text-bronze border border-bronze/30 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-bronze/10"
                          >
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Steps and Info */}
                    {message.sender === 'bot' && message.data?.steps && (
                      <div className="ml-8 mt-2 bg-white/5 rounded-xl p-4 border border-white/10 w-[85%]">
                        {message.data.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                            <div className="w-5 h-5 rounded-full bg-bronze/20 text-bronze text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-bronze/20">
                              {idx + 1}
                            </div>
                            <p className="text-gray-300 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-end gap-2 ml-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-3 h-3 text-bronze" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5">
                {/* Default Quick Actions (if chat is empty or new) */}
                {messages.length < 2 && (
                  <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.action)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-bronze/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                      >
                        <action.icon className="h-3.5 w-3.5 text-bronze" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-bronze/20 to-amber-700/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center bg-gray-900/80 border border-white/10 rounded-2xl p-1.5 transition-all focus-within:border-bronze/50 focus-within:bg-black">
                    <button
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                      title="Menu"
                      onClick={() => handleQuickAction('Menu')}
                    >
                      <Bars3Icon className="h-6 w-6" />
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-sm focus:ring-0 px-3 py-2"
                    />

                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="p-2.5 bg-gradient-to-r from-bronze to-amber-700 rounded-xl text-white shadow-lg shadow-bronze/20 hover:shadow-bronze/40 disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform active:scale-95"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 transform -rotate-45 translate-x-0.5" />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-[10px] text-gray-600">Powered by SilaiMart AI</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;