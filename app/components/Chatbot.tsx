'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChatMessages, useHandleChatMessage } from '../hooks/useApi';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { ChatMessage } from '../lib/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useChatMessages(user?.id || '');
  const handleChatMutation = useHandleChatMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.id) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      await handleChatMutation.mutateAsync({
        userId: user.id,
        message: userMessage,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#39FF14] text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Open chatbot"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#39FF14] rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">অর্বান ফার্মিং চ্যাটবট</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">সাহায্যের জন্য রেডি</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">হ্যালো! 👋</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    আপনার কোনো প্রশ্ন আছে? আমি সাহায্য করতে পারি।
                  </p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {msg.isBot && (
                      <div className="w-8 h-8 bg-[#39FF14] rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-black" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.isBot
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : 'bg-[#39FF14] text-black'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!msg.isBot && (
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার মেসেজ লিখুন..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#39FF14] dark:bg-gray-800 dark:text-white"
                  disabled={handleChatMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || handleChatMutation.isPending}
                  className="bg-[#39FF14] text-black p-2 rounded-full hover:bg-[#28CC0C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}