'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useConversations, useConversationMessages, useSendMessage } from '../hooks/useApi';

interface Conversation {
  id: number;
  participant1: { id: number; name: string; profileImage?: string };
  participant2: { id: number; name: string; profileImage?: string };
  messages: any[];
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: number;
  content: string;
  sender: { id: number; name: string; profileImage?: string };
  createdAt: string;
  isRead: boolean;
}

export default function Conversations() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useConversations();
  const { data: messages = [], refetch: refetchMessages } = useConversationMessages(selectedConversation?.id);
  const sendMessageMutation = useSendMessage();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      // Join user room for notifications
      newSocket.emit('join_user_room', user.id);
    });

    newSocket.on('new_message', (data) => {
      console.log('New message received:', data);
      // Refresh messages if this conversation is selected
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        refetchMessages();
      }
      // Refresh conversations list to update last message
      // You might want to add a refetch for conversations here
    });

    newSocket.on('notification', (data) => {
      console.log('Notification received:', data);
      // Handle notifications (could show toast, update unread count, etc.)
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedConversation, refetchMessages]);

  // Join conversation room when conversation is selected
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit('join_conversation', selectedConversation.id);

    return () => {
      socket.emit('leave_conversation', selectedConversation.id);
    };
  }, [socket, selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageInput.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1.id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view conversations</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conversation: Conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const lastMessage = conversation.messages[0];

              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherParticipant.profileImage || '/default-avatar.png'}
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant.name}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={getOtherParticipant(selectedConversation).profileImage || '/default-avatar.png'}
                  alt={getOtherParticipant(selectedConversation).name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h3 className="text-lg font-medium text-gray-900">
                  {getOtherParticipant(selectedConversation).name}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.id === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender.id === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-gray-300 mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}