import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

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
  }, [messages]);

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
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.startsWith('redirect:')) {
      const url = action.replace('redirect:', '');
      window.location.href = url;
      return;
    }
    setInputMessage(action);
    setTimeout(() => sendMessage(), 100);
  };

  const quickActions = [
    { label: 'Show Products', action: 'Show me your sculptures', icon: ShoppingBagIcon },
    { label: 'Shipping Info', action: 'Tell me about shipping', icon: TruckIcon },
    { label: 'Help & Support', action: 'I need help', icon: QuestionMarkCircleIcon }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-bronze to-gold text-black p-4 rounded-full shadow-2xl hover:shadow-bronze/25 transition-all duration-300 transform hover:scale-110 group"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6 group-hover:animate-pulse" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-96 h-[500px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-bronze to-gold p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="text-black font-bold">{botConfig?.name || 'SilaiMart Assistant'}</h3>
              <p className="text-black/70 text-sm">Online • AI Powered</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-black/70 hover:text-black transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-bronze text-black rounded-l-2xl rounded-tr-2xl' 
                  : 'bg-gray-800 text-white rounded-r-2xl rounded-tl-2xl'
              } p-3 shadow-lg`}>
                <p className="text-sm">{message.message}</p>
                
                {/* Enhanced response types */}
                {message.type === 'product' && message.data?.products && (
                  <div className="mt-3 space-y-2">
                    {message.data.products.map((product, idx) => (
                      <div key={idx} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-600 transition-colors cursor-pointer"
                           onClick={() => window.open(`/product/${product._id}`, '_blank')}>
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{product.name}</p>
                          <p className="text-bronze text-xs">₹{(product.discountPrice || product.price).toLocaleString()}</p>
                          {product.category && (
                            <p className="text-gray-400 text-xs">{product.category.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {message.data.suggestions && (
                      <div className="mt-2 text-xs text-gray-400">
                        {message.data.suggestions.map((suggestion, idx) => (
                          <p key={idx}>• {suggestion}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action responses with quick replies */}
                {message.type === 'action' && message.data && (
                  <div className="mt-3 space-y-2">
                    {message.data.quickReplies && (
                      <div className="flex flex-wrap gap-1">
                        {message.data.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(reply.action)}
                            className="bg-bronze/20 hover:bg-bronze/30 text-bronze px-2 py-1 rounded text-xs transition-colors"
                          >
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {message.data.priceRanges && (
                      <div className="space-y-1">
                        {message.data.priceRanges.map((range, idx) => (
                          <div key={idx} className="bg-gray-700 rounded p-2">
                            <p className="text-bronze text-xs font-medium">{range.range}</p>
                            <p className="text-gray-300 text-xs">{range.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.data.shippingInfo && (
                      <div className="space-y-1">
                        {message.data.shippingInfo.map((info, idx) => (
                          <div key={idx} className="bg-gray-700 rounded p-2">
                            <p className="text-bronze text-xs font-medium">{info.type}</p>
                            <p className="text-gray-300 text-xs">{info.condition} - {info.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.data.materials && (
                      <div className="space-y-1">
                        {message.data.materials.map((material, idx) => (
                          <div key={idx} className="bg-gray-700 rounded p-2">
                            <p className="text-bronze text-xs font-medium">{material.name}</p>
                            <p className="text-gray-300 text-xs">{material.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.data.suggestions && (
                      <div className="space-y-1">
                        {message.data.suggestions.map((suggestion, idx) => (
                          <p key={idx} className="text-gray-300 text-xs">{suggestion}</p>
                        ))}
                      </div>
                    )}
                    
                    {message.data.steps && (
                      <div className="space-y-1">
                        {message.data.steps.map((step, idx) => (
                          <p key={idx} className="text-gray-300 text-xs">{idx + 1}. {step}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white rounded-r-2xl rounded-tl-2xl p-3 shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-full text-xs transition-colors"
                >
                  <action.icon className="h-3 w-3" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:border-bronze focus:outline-none text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-bronze hover:bg-gold text-black p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;