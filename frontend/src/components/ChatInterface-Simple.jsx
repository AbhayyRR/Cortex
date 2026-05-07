import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function ChatInterface({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Mock API call
      const response = await api.sendMessage(input);
      
      // Add AI response
      const aiMessage = {
        id: Date.now().toString(),
        content: response.message || 'I understand your message. How can I help you today?',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'ai'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      showToast('Message sent successfully', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0a0a0f',
      color: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(20px)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#f8fafc',
          margin: '0 0 20px 0'
        }}>
          🚀 CortexFlow AI Chat
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          margin: '0 0 10px 0'
        }}>
          Ask me anything! I'm here to help.
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((message, index) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              marginBottom: '16px',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: message.sender === 'user' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                  : 'rgba(59, 130, 246, 0.1)',
                color: '#f8fafc'
              }}
            >
              <p style={{
                fontSize: '14px',
                margin: '0 0 8px 0',
                lineHeight: '1.4'
              }}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(59, 130, 246, 0.1)',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSend();
              }
            }}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isLoading 
                ? 'rgba(59, 130, 246, 0.5)' 
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isLoading ? (
              <span>⏳ Sending...</span>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
