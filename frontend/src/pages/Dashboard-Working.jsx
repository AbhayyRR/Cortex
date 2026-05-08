import React, { useState, useEffect, useCallback } from 'react';
import { ChatPage } from './ChatPage';
import { UploadPage } from './UploadPage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { 
  Bot, 
  MessageSquare, 
  Upload, 
  Settings, 
  User, 
  Clock, 
  Zap, 
  Brain, 
  Activity,
  ChevronRight,
  Menu,
  X,
  Send,
  Paperclip,
  Mic,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('chat');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle upload success - switch to chat
  const handleUploadSuccess = () => {
    setActiveView('chat');
  };

  // Load task history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taskHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTaskHistory(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load task history:', err);
    }
  }, []);

  // Handle task history click
  const loadTaskFromHistory = (task) => {
    console.log('Loading task from history:', task);
    setActiveView('chat');
  };

  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
                  CortexFlow
                </h1>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  AI Assistant
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>Online</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  color: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                {sidebarOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          <div style={{
            width: isMobile ? '100%' : '320px',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(59, 130, 246, 0.1)',
            display: isMobile ? (sidebarOpen ? 'block' : 'none') : 'block'
          }}>
            {/* Sidebar Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}>
                  <Bot style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}>
                    CortexFlow
                  </h2>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    AI Assistant
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div style={{ padding: '16px' }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '16px',
                letterSpacing: '0.05em'
              }}>
                Navigation
              </h3>
              <button
                onClick={() => { setActiveView('chat'); setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeView === 'chat' 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  color: activeView === 'chat' ? 'white' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}
              >
                <MessageSquare style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: '500' }}>AI Chat</span>
                {activeView === 'chat' && (
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#10b981', 
                    borderRadius: '50%',
                    marginLeft: 'auto' 
                  }}></div>
                )}
              </button>
              
              <button
                onClick={() => { setActiveView('upload'); setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeView === 'upload' 
                    ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  color: activeView === 'upload' ? 'white' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Upload style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: '500' }}>Upload Documents</span>
                {activeView === 'upload' && (
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#10b981', 
                    borderRadius: '50%',
                    marginLeft: 'auto' 
                  }}></div>
                )}
              </button>
            </div>

            {/* Recent Conversations */}
            <div style={{ padding: '16px', flex: 1 }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '16px',
                letterSpacing: '0.05em'
              }}>
                Recent
              </h3>
              {taskHistory.length === 0 ? (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <MessageSquare style={{ width: '48px', height: '48px', color: '#6b7280', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500', marginBottom: '8px' }}>
                    No conversations yet
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Start chatting to see history
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {taskHistory.slice(0, 5).map((task, index) => (
                    <div
                      key={task.taskId}
                      onClick={() => { loadTaskFromHistory(task); setSidebarOpen(false); }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#f8fafc',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.query.substring(0, 30)}...
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            {new Date(task.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {task.status === 'completed' && (
                            <div style={{
                              width: '20px',
                              height: '20px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                width: '8px',
                                  height: '8px',
                                  background: '#10b981',
                                  borderRadius: '50%'
                              }}></div>
                            </div>
                          )}
                          {task.status === 'failed' && (
                            <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Content Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <h1 style={{
                      fontSize: '20px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent'
                      }}>
                      CortexFlow AI
                    </h1>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      Intelligent Document Assistant
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center'
                  }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>Online</span>
                  </div>
                  <button
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <Settings style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeView === 'chat' ? (
                <ChatPage showToast={showToast} />
              ) : (
                <UploadPage onUploadSuccess={handleUploadSuccess} showToast={showToast} />
              )}
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 50,
            animation: 'slideInUp 0.4s ease-out'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {toast.type === 'success' && (
                    <div style={{
                      width: '20px',
                        height: '20px',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                      <Sparkles style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                  )}
                  {toast.type === 'error' && (
                    <div style={{
                      width: '20px',
                        height: '20px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                      <X style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                  )}
                  {toast.type === 'info' && (
                    <div style={{
                      width: '20px',
                        height: '20px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                      <Activity style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#f8fafc',
                  fontWeight: '500',
                  flex: 1
                }}>
                  {toast.message}
                </p>
                <button
                  onClick={() => setToast(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        )}

              </div>
    </ErrorBoundary>
  );
}
