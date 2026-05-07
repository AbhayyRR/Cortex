import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import StepTimeline from './StepTimeline';

export default function Chat({ 
  messages, 
  setMessages, 
  currentTask, 
  setCurrentTask, 
  addMessage, 
  addTaskToHistory,
  showToast
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [taskStatus, setTaskStatus] = useState('idle');
  const [currentSteps, setCurrentSteps] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('💬 Chat State:', { 
      messages: messages.length, 
      input: input.length, 
      isTyping, 
      taskStatus, 
      currentTask: currentTask?.taskId 
    });
  }, [messages, input, isTyping, taskStatus, currentTask]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for task results when a task is running
  useEffect(() => {
    if (currentTask && currentTask.status === 'running') {
      const pollInterval = setInterval(async () => {
        try {
          const result = await api.getResult(currentTask.taskId);
          
          if (result && result.length > 0) {
            // Update task status based on results
            const hasResults = result.some(r => r.result);
            const allCompleted = result.every(r => r.result);
            
            if (allCompleted) {
              setTaskStatus('completed');
              setCurrentTask(prev => ({ ...prev, status: 'completed' }));
              
              // Add final result message
              const finalResult = result[result.length - 1].result;
              addMessage({
                type: 'assistant',
                content: finalResult,
                steps: result
              });
              
              // Update task in history
              addTaskToHistory({
                ...currentTask,
                status: 'completed',
                messages: messages,
                timestamp: new Date().toISOString()
              });
              
              clearInterval(pollInterval);
            } else if (hasResults) {
              // Update steps with partial results
              setCurrentSteps(result);
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
          setTaskStatus('failed');
          setCurrentTask(prev => ({ ...prev, status: 'failed' }));
          clearInterval(pollInterval);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [currentTask, messages, addMessage, addTaskToHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    console.log('📤 Submitting chat message:', userMessage);
    setInput('');
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    });

    // Show typing indicator
    setIsTyping(true);
    setTaskStatus('planning');
    setCurrentSteps([]);

    try {
      // Create task
      const taskResponse = await api.createTask(userMessage);
      
      // Add AI thinking message
      addMessage({
        type: 'assistant',
        content: 'I\'m working on your task...',
        isThinking: true
      });

      // Set current task
      const task = {
        taskId: taskResponse.task_id,
        query: userMessage,
        status: 'running',
        steps: taskResponse.steps || [],
        timestamp: new Date().toISOString()
      };
      
      setCurrentTask(task);
      setTaskStatus('running');
      
      // Show initial steps
      if (taskResponse.steps && taskResponse.steps.length > 0) {
        setCurrentSteps(taskResponse.steps.map((step, index) => ({
          id: index,
          tool: step.tool,
          input: step.input,
          status: 'pending',
          result: null
        })));
      }

    } catch (error) {
      setIsTyping(false);
      setTaskStatus('failed');
      
      showToast(`Error: ${error.message}`, 'error');
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(2)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={i} className="text-base font-semibold mt-3 mb-2">{line.slice(3)}</h4>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4">{line.slice(2)}</li>;
        }
        if (line.startsWith('```')) {
          return (
            <pre key={i} className="bg-dark-surface border border-dark-border rounded-lg p-3 mt-2 mb-2 overflow-x-auto">
              <code className="text-sm">{line.slice(3)}</code>
            </pre>
          );
        }
        return <p key={i} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark-text mb-2">
              Welcome to CortexFlow
            </h3>
            <p className="text-dark-textSecondary mb-4">
              Upload documents and ask questions to get AI-powered answers
            </p>
            <div className="space-y-2 text-sm text-dark-textSecondary">
              <p>💬 Ask questions about your uploaded documents</p>
              <p>📄 Upload PDFs to build your knowledge base</p>
              <p>🤖 Get real-time AI assistance</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`max-w-3xl ${
                message.type === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-surface border border-dark-border text-dark-text'
              } rounded-2xl px-6 py-4`}>
                {message.type === 'system' ? (
                  <div className="flex items-center space-x-2">
                    <span>{message.content}</span>
                  </div>
                ) : message.isThinking ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>AI is thinking...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formatMessage(message.content)}
                    {message.steps && (
                      <div className="mt-4 pt-4 border-t border-dark-border">
                        <button className="text-sm text-primary hover:underline">
                          View detailed steps →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Task Status Display */}
        {taskStatus !== 'idle' && taskStatus !== 'completed' && (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 animate-slide-up">
            <StepTimeline 
              steps={currentSteps} 
              status={taskStatus}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-border p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your documents..."
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 pr-12 text-dark-text placeholder-dark-textSecondary focus:outline-none focus:border-primary transition-colors"
              disabled={isTyping}
            />
            {isTyping && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-primary text-white rounded-xl px-6 py-3 font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isTyping ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
