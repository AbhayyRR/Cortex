import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { useTaskManager } from '../hooks/useTaskManager';
import { TaskExecution } from './TaskExecution';
import { LiveTaskTimeline } from './LiveTaskTimeline';
import { StreamingResponse } from './StreamingResponse';
import { MemoryPanel } from './MemoryPanel';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Mic, 
  Sparkles, 
  Copy, 
  ThumbsUp, 
  RefreshCw,
  Zap,
  Brain,
  MessageSquare,
  Clock,
  User,
  Settings,
  X
} from 'lucide-react';

export default function ChatInterface({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [showMemory, setShowMemory] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Task management
  const {
    currentTask,
    taskHistory,
    isExecuting,
    error: taskError,
    createTask,
    updateTaskStatus,
    clearError: clearTaskError,
    resetTask
  } = useTaskManager();

  // Polling for task results
  const { isPolling, currentResult } = useTaskPolling(
    currentTask?.taskId,
    // onResult callback
    (result) => {
      updateTaskStatus(result);
      
      // Update streaming message if we're currently streaming
      if (currentStreamingText && result.result) {
        setCurrentStreamingText(result.result);
      }
    },
    // onError callback
    (err) => {
      setError(err);
      setIsTyping(false);
      setCurrentStreamingText('');
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `I encountered an error while processing your request: ${err.message}`,
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    },
    // onComplete callback
    (result) => {
      setIsTyping(false);
      
      // Replace streaming message with final result
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isStreaming);
        return [...filtered, {
          type: 'assistant',
          content: result.result || 'I\'ve completed your task successfully.',
          steps: result.steps,
          taskId: currentTask?.taskId,
          timestamp: new Date().toISOString()
        }];
      });
      
      setCurrentStreamingText('');
    }
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingText]);

  // Focus input when not typing
  useEffect(() => {
    if (!isTyping && !isExecuting) {
      inputRef.current?.focus();
    }
  }, [isTyping, isExecuting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping || isExecuting) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    clearTaskError();

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Create task
      const task = await createTask(userMessage);
      
      // Add initial assistant message with streaming
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: '',
        isStreaming: true,
        taskId: task.taskId,
        timestamp: new Date().toISOString()
      }]);

      // Start with planning message
      setCurrentStreamingText("I'm planning your task...");

      // Task polling will handle the rest
    } catch (err) {
      setIsTyping(false);
      setError(err);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `I'm having trouble creating your task: ${err.message}`,
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleRetry = () => {
    setError(null);
    clearTaskError();
    if (currentTask) {
      // Retry the last task
      createTask(currentTask.query);
    }
  };

  const clearError = () => {
    setError(null);
    clearTaskError();
  };

  const loadTaskFromMemory = (task) => {
    // Load a previous task into the chat
    setMessages([
      {
        type: 'user',
        content: task.query,
        timestamp: task.timestamp
      },
      {
        type: 'assistant',
        content: task.result || 'Here\'s what I found for your previous query:',
        steps: task.steps,
        taskId: task.taskId,
        timestamp: task.timestamp,
        isMemoryReload: true
      }
    ]);
    
    setCurrentTask(task);
    setShowMemory(false);
  };

  const formatMessage = (content) => {
    // Enhanced markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-gray-100">{line.slice(2)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={i} className="text-base font-semibold mt-3 mb-2 text-gray-100">{line.slice(3)}</h4>;
        }
        if (line.startsWith('### ')) {
          return <h5 key={i} className="text-sm font-semibold mt-2 mb-1 text-gray-200">{line.slice(4)}</h5>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-6 mb-1 text-gray-300 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('* ')) {
          return <li key={i} className="ml-6 mb-1 text-gray-300 list-disc">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={i} className="ml-6 mb-1 text-gray-300 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }
        if (line.startsWith('```')) {
          return (
            <pre key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 my-2 overflow-x-auto text-sm">
              <code className="text-gray-100">{line.slice(3)}</code>
            </pre>
          );
        }
        if (line.startsWith('`')) {
          return (
            <code key={i} className="bg-gray-800 px-2 py-1 rounded text-sm text-gray-100">
              {line.replace(/`/g, '')}
            </code>
          );
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="mb-2 text-gray-100 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-dark">
      {/* Header */}
      <div className="card-neon border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-cyan rounded-2xl flex items-center justify-center animate-neon-glow">
              <span className="text-white font-bold text-xl">CF</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-cyan">CortexFlow AI</h1>
              <p className="text-sm text-gray-300">Your intelligent document assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMemory(!showMemory)}
              className={`px-5 py-3 text-sm rounded-2xl transition-all duration-300 flex items-center space-x-3 hover-lift ${
                showMemory 
                  ? 'bg-gradient-cyan text-white shadow-lg shadow-cyan-500/25 animate-neon-glow' 
                  : 'btn-neon text-gray-300'
              }`}
            >
              <span className="text-xl">🧠</span>
              <span className="font-semibold">Memory</span>
              {showMemory && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
            </button>
            <div className="flex items-center space-x-2 card-neon px-4 py-3 rounded-2xl">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Memory Panel */}
        {showMemory && (
          <MemoryPanel
            taskHistory={taskHistory}
            onLoadTask={loadTaskFromMemory}
            onClose={() => setShowMemory(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                {/* AI Avatar */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center neon-glow animate-float">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Welcome Message */}
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold text-gradient-primary mb-4">
                    Welcome to CortexFlow AI
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    I'm your intelligent document assistant. Upload PDFs and ask me anything about them.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary/20 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Upload Documents</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Build your knowledge base with intelligent PDF indexing and semantic search
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-accent/20 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Ask Questions</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Get detailed answers with context-aware responses and real-time analysis
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary/20 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Memory Context</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      I remember our conversations for seamless follow-up and continuity
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-accent/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Real-time Updates</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Live task execution with streaming responses and progress tracking
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`max-w-4xl ${
                    message.type === 'user' 
                      ? 'bg-gradient-primary text-white' 
                      : message.isError 
                        ? 'bg-red-900/50 text-red-100 border border-red-500/30 glass-card'
                        : 'glass-card text-gray-100'
                  } rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300`}>
                    {message.type === 'user' ? (
                      <div className="text-base leading-relaxed font-medium">{message.content}</div>
                    ) : (
                      <div>
                        {message.isMemoryReload && (
                          <div className="text-xs text-gray-400 mb-3 flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg inline-block">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="font-medium ml-2">Reloaded from memory</span>
                          </div>
                        )}
                        {message.isStreaming ? (
                          <StreamingResponse 
                            text={currentStreamingText}
                            isTyping={isTyping}
                          />
                        ) : (
                          <div className="text-base leading-relaxed">
                            {formatMessage(message.content)}
                            {message.steps && (
                              <div className="mt-6 pt-4 border-t border-gray-700/50">
                                <button 
                                  className="btn-premium px-4 py-2 rounded-lg text-sm hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                  onClick={() => {
                                    // Show steps in detail
                                    console.log('Show steps:', message.steps);
                                  }}
                                >
                                  <Zap className="w-4 h-4" />
                                  <span className="font-medium">View execution steps ({message.steps.length})</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-start justify-between mt-3">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {message.type === 'assistant' && !message.isStreaming && (
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                            onClick={() => {
                              // Copy message
                              navigator.clipboard.writeText(message.content);
                              showToast('Message copied to clipboard', 'success');
                            }}
                          >
                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                          </button>
                          <button 
                            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                            onClick={() => {
                              // Like message
                              console.log('Like message:', message);
                            }}
                          >
                            <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                          </button>
                          <button 
                            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                            onClick={() => {
                              // Regenerate response
                              console.log('Regenerate Response:', message);
                            }}
                          >
                            <RefreshCw className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Live Task Timeline */}
            {(currentTask || isExecuting) && (
              <LiveTaskTimeline
                currentTask={currentTask}
                currentResult={currentResult}
                isExecuting={isExecuting}
                isPolling={isPolling}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {(error || taskError) && (
            <div className="mx-6 mb-6 animate-slideInUp">
              <div className="card-neon border-2 border-red-500/50 rounded-3xl p-6 text-red-100">
                <div className="flex items-start space-x-4">
                  <span className="text-red-400 text-2xl">❌</span>
                  <div className="flex-1">
                    <p className="font-semibold text-red-200 text-lg">Error</p>
                    <p className="text-red-300 mt-2">{(error || taskError).message}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-200 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleRetry}
                    className="btn-neon px-5 py-3 rounded-xl text-sm hover-lift flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span className="font-medium">Retry</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="glass-card border-t border-gray-800 p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                {/* Attachment Button */}
                <button
                  type="button"
                  className="btn-premium p-3 rounded-xl hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    // Handle file attachment
                    console.log('Attach file');
                  }}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {/* Input Field */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your documents..."
                    disabled={isTyping || isExecuting}
                    className="input-premium rounded-xl pr-24 disabled:opacity-50 disabled:cursor-not-allowed"
                    maxLength={1000}
                  />
                  
                  {/* Character Counter */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {input.length}/1000
                  </div>
                </div>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  className="btn-premium p-3 rounded-xl hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    // Handle voice input
                    console.log('Voice input');
                  }}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping || isExecuting}
                  className={`btn-premium px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 ${
                    !input.trim() || isTyping || isExecuting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-gradient-primary text-white neon-glow'
                  }`}
                >
                  {(isTyping || isExecuting) ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="font-medium">Send</span>
                </button>
              </form>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  {isTyping && (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>AI is thinking...</span>
                    </>
                  )}
                  {isExecuting && (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>Processing your request...</span>
                    </>
                  )}
                  {!isTyping && !isExecuting && (
                    <>
                      <Sparkles className="w-4 h-4 text-gray-500" />
                      <span>Ready to assist</span>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Enter</kbd> to send, <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Shift+Enter</kbd> for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
