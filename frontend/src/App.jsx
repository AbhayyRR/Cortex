import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  FileText,
  Globe,
  Cpu,
  Wifi,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [currentSteps, setCurrentSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = '#0F172A';
    document.body.style.color = '#f8fafc';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", sans-serif';
    document.body.style.background = `
      radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
      #0F172A
    `;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setCurrentSteps([]);
    setCurrentStepIndex(0);

    try {
      const conversation = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await fetch('http://localhost:8002/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input, conversation })
      });

      if (response.ok) {
        const data = await response.json();
        const taskId = data.task_id;
        const steps = data.steps || [];
        
        // Display planned steps
        setCurrentSteps(steps);
        
        // Add steps message
        const stepsMessage = {
          id: Date.now() + 1,
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          steps: steps,
          isSteps: true
        };
        setMessages(prev => [...prev, stepsMessage]);
        
        // Execute steps one by one
        for (let i = 0; i < steps.length; i++) {
          setCurrentStepIndex(i);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate step processing
        }
        
        // Poll for results
        const pollInterval = setInterval(async () => {
          try {
            const resultResponse = await fetch(`http://localhost:8002/result/${taskId}`);
            if (resultResponse.ok) {
              const results = await resultResponse.json();
              if (results.length > 0) {
                clearInterval(pollInterval);
                const lastResult = results[results.length - 1];
                const aiMessage = {
                  id: Date.now() + 2,
                  content: lastResult.result || 'Task completed',
                  sender: 'ai',
                  timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
                setCurrentSteps([]);
                setCurrentStepIndex(0);
              }
            }
          } catch (error) {
            clearInterval(pollInterval);
            const aiMessage = {
              id: Date.now() + 2,
              content: 'Error fetching result',
              sender: 'ai',
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
            setCurrentSteps([]);
            setCurrentStepIndex(0);
          }
        }, 1000);
      } else {
        const aiMessage = {
          id: Date.now() + 1,
          content: 'Failed to process task',
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }
    } catch (error) {
      const aiMessage = {
        id: Date.now() + 1,
        content: 'Network error. Please check backend connection.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please upload PDF files' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      for (const file of pdfFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8002/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          setUploadedFiles(prev => [...prev, file.name]);
        }
      }

      setUploadStatus({ type: 'success', message: `Successfully uploaded ${pdfFiles.length} file(s)` });
      setTimeout(() => setActiveView('chat'), 1500);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error. Please check backend connection.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummary(null);

    try {
      const response = await fetch('http://localhost:8002/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        setSummary('Error: Could not generate summary');
      }
    } catch (error) {
      setSummary('Error: Network error');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
        #0F172A
      `,
      color: '#f8fafc',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          width: '280px',
          background: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.08)'
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Bot style={{ width: '22px', height: '22px', color: 'white' }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                CortexFlow
              </h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
                AI Workspace
              </p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px', flex: 1 }}>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('chat')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeView === 'chat' 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' 
                : 'transparent',
              color: activeView === 'chat' ? '#f8fafc' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
              border: activeView === 'chat' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <MessageSquare style={{ width: '18px', height: '18px' }} />
            <span>AI Chat</span>
            {activeView === 'chat' && (
              <motion.div
                layout
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  marginLeft: 'auto',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
              />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('upload')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeView === 'upload' 
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)' 
                : 'transparent',
              color: activeView === 'upload' ? '#f8fafc' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
              border: activeView === 'upload' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Upload style={{ width: '18px', height: '18px' }} />
            <span>Upload</span>
            {activeView === 'upload' && (
              <motion.div
                layout
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#06B6D4',
                  borderRadius: '50%',
                  marginLeft: 'auto',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                }}
              />
            )}
          </motion.button>

          {/* Recent Conversations */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.05em'
            }}>
              Recent
            </h3>
            
            {messages.length === 0 ? (
              <div style={{
                padding: '16px',
                background: 'rgba(99, 102, 241, 0.03)',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px dashed rgba(99, 102, 241, 0.15)'
              }}>
                <MessageSquare style={{ width: '24px', height: '24px', color: '#64748b', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  No conversations yet
                </p>
              </div>
            ) : (
              messages.slice(-3).map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.03)',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    border: '1px solid rgba(99, 102, 241, 0.08)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <p style={{
                    fontSize: '12px',
                    color: '#e2e8f0',
                    margin: 0,
                    overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {msg.content.substring(0, 30)}...
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
        </div>

        {/* System Status - Compact */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(99, 102, 241, 0.08)' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              padding: '6px 10px',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: '#10b981',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
              }} />
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '500' }}>Online</span>
            </div>

            <div style={{
              padding: '6px 10px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '20px',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Brain style={{ width: '12px', height: '12px', color: '#6366F1' }} />
              <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: '500' }}>Memory</span>
            </div>

            <div style={{
              padding: '6px 10px',
              background: 'rgba(139, 92, 246, 0.08)',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Cpu style={{ width: '12px', height: '12px', color: '#8B5CF6' }} />
              <span style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '500' }}>Groq</span>
            </div>
          </div>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              border: '1px solid rgba(99, 102, 241, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>User</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Pro Plan</p>
            </div>
            <ChevronRight style={{ width: '14px', height: '14px', color: '#64748b' }} />
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            padding: '16px 32px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
            background: 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '10px',
                padding: '10px',
                color: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              {sidebarOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
            </motion.button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '20px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                }} />
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>Online</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <Settings style={{ width: '18px', height: '18px' }} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeView === 'chat' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px'
              }}>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      maxWidth: '900px',
                      margin: '0 auto',
                      textAlign: 'center',
                      padding: '80px 20px'
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 1],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
                        borderRadius: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 40px',
                        boxShadow: '0 0 60px rgba(99, 102, 241, 0.5), 0 0 100px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <Sparkles style={{ width: '48px', height: '48px', color: 'white' }} />
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        fontSize: '56px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: '0 0 20px 0',
                        letterSpacing: '-0.03em'
                      }}
                    >
                      Welcome to CortexFlow
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ fontSize: '20px', color: '#64748b', marginBottom: '60px', fontWeight: '400' }}
                    >
                      Your intelligent AI workspace powered by advanced language models
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '20px',
                        maxWidth: '900px',
                        margin: '0 auto'
                      }}
                    >
                      {[
                        { icon: FileText, title: 'Upload Documents', desc: 'Build your knowledge base', color: '#6366F1' },
                        { icon: MessageSquare, title: 'Ask Questions', desc: 'Get detailed answers', color: '#8B5CF6' },
                        { icon: Brain, title: 'Memory Context', desc: 'Remembers conversations', color: '#06B6D4' },
                        { icon: Zap, title: 'Real-time Updates', desc: 'Live task execution', color: '#10B981' }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          whileHover={{ 
                            scale: 1.05, 
                            y: -8,
                            boxShadow: `0 20px 40px rgba(${item.color === '#6366F1' ? '99, 102, 241' : item.color === '#8B5CF6' ? '139, 92, 246' : item.color === '#06B6D4' ? '6, 182, 212' : '16, 185, 129'}, 0.3)`
                          }}
                          style={{
                            padding: '28px',
                            background: `rgba(${item.color === '#6366F1' ? '99, 102, 241' : item.color === '#8B5CF6' ? '139, 92, 246' : item.color === '#06B6D4' ? '6, 182, 212' : '16, 185, 129'}, 0.06)`,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid rgba(${item.color === '#6366F1' ? '99, 102, 241' : item.color === '#8B5CF6' ? '139, 92, 246' : item.color === '#06B6D4' ? '6, 182, 212' : '16, 185, 129'}, 0.15)`,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <item.icon style={{ width: '36px', height: '36px', color: item.color, marginBottom: '16px' }} />
                          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0', color: '#f8fafc' }}>{item.title}</h3>
                          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{
                            marginBottom: '24px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          {msg.sender === 'ai' && (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
                            </div>
                          )}
                          <div style={{
                            flex: 1,
                            background: msg.sender === 'user'
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                              : 'rgba(59, 130, 246, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: msg.sender === 'user'
                              ? '1px solid rgba(59, 130, 246, 0.3)'
                              : '1px solid rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            boxShadow: msg.sender === 'user'
                              ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                              : '0 4px 20px rgba(0, 0, 0, 0.2)'
                          }}>
                            {msg.isSteps && msg.steps ? (
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', margin: '0 0 12px 0' }}>
                                  📋 Execution Plan
                                </p>
                                {msg.steps.map((step, stepIdx) => (
                                  <div
                                    key={stepIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      padding: '10px',
                                      marginBottom: '8px',
                                      background: 'rgba(59, 130, 246, 0.05)',
                                      borderRadius: '8px',
                                      border: stepIdx === currentStepIndex
                                        ? '1px solid rgba(6, 182, 212, 0.5)'
                                        : '1px solid rgba(59, 130, 246, 0.1)'
                                    }}
                                  >
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: stepIdx < currentStepIndex
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : stepIdx === currentStepIndex
                                        ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                                        : 'rgba(59, 130, 246, 0.2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      color: stepIdx < currentStepIndex ? 'white' : '#94a3b8'
                                    }}>
                                      {stepIdx < currentStepIndex ? '✓' : stepIdx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>
                                        {step.tool}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                        {step.input}
                                      </div>
                                    </div>
                                    {stepIdx === currentStepIndex && isTyping && (
                                      <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          background: '#06b6d4'
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <p style={{ fontSize: '15px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {(() => {
                                    try {
                                      // Try to parse as JSON (for tool results)
                                      const parsed = JSON.parse(msg.content);
                                      
                                      // Handle retrieve results with confidence
                                      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text && parsed[0].confidence) {
                                        return parsed.map((item, idx) => (
                                          <div key={idx} style={{ marginBottom: idx < parsed.length - 1 ? '12px' : '0' }}>
                                            <div style={{ fontSize: '15px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                              {item.text}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                              <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 8px',
                                                background: 'rgba(6, 182, 212, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                color: '#06b6d4',
                                                fontWeight: '500'
                                              }}>
                                                <FileText style={{ width: '12px', height: '12px' }} />
                                                {item.source.filename} (Page {item.source.page})
                                              </div>
                                              <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                color: '#10b981',
                                                fontWeight: '500'
                                              }}>
                                                Confidence: {(item.confidence * 100).toFixed(1)}%
                                              </div>
                                            </div>
                                          </div>
                                        ));
                                      }
                                      
                                      // Handle search results
                                      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].match_position !== undefined) {
                                        return (
                                          <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#8b5cf6', marginBottom: '8px' }}>
                                              🔍 Found {parsed.length} matches
                                            </p>
                                            {parsed.map((item, idx) => (
                                              <div key={idx} style={{ marginBottom: '12px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '14px', marginBottom: '6px' }}>{item.text}</div>
                                                <div style={{ fontSize: '11px', color: '#8b5cf6' }}>
                                                  <FileText style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                                                  {item.source.filename} (Page {item.source.page})
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      
                                      // Handle extract results
                                      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].entities !== undefined) {
                                        return (
                                          <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
                                              📋 Extracted {parsed.length} results
                                            </p>
                                            {parsed.map((item, idx) => (
                                              <div key={idx} style={{ marginBottom: '12px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '4px' }}>
                                                  {item.source.filename} (Page {item.source.page})
                                                </div>
                                                <div style={{ fontSize: '14px' }}>
                                                  {item.entities.join(', ')}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      
                                      // Handle compare results
                                      if (typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
                                        return (
                                          <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#06b6d4', marginBottom: '12px' }}>
                                              📊 Document Comparison
                                            </p>
                                            {parsed._summary && (
                                              <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                  <strong>Total Documents:</strong> {parsed._summary.total_documents}
                                                </div>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                  <strong>Common Skills:</strong> {parsed._summary.common_skills.length > 0 ? parsed._summary.common_skills.join(', ') : 'None found'}
                                                </div>
                                                <div style={{ fontSize: '13px' }}>
                                                  <strong>Skill Overlap:</strong> {parsed._summary.skill_overlap ? 'Yes' : 'No'}
                                                </div>
                                              </div>
                                            )}
                                            {Object.entries(parsed).filter(([key]) => !key.startsWith('_')).map(([filename, data], idx) => (
                                              <div key={idx} style={{ marginBottom: '12px', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{filename}</div>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                  <strong>Word Count:</strong> {data.word_count}
                                                </div>
                                                {data.skills && data.skills.length > 0 && (
                                                  <div style={{ marginBottom: '8px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Skills:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                      {data.skills.map((skill, sidx) => (
                                                        <span key={sidx} style={{
                                                          padding: '4px 10px',
                                                          background: 'rgba(6, 182, 212, 0.2)',
                                                          borderRadius: '20px',
                                                          fontSize: '11px',
                                                          color: '#06b6d4'
                                                        }}>
                                                          {skill}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                                {data.key_themes && (
                                                  <div style={{ fontSize: '13px' }}>
                                                    <strong>Key Themes:</strong> {data.key_themes.join(', ')}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      
                                      // Handle analyze results
                                      if (typeof parsed === 'object' && parsed.sentiment !== undefined) {
                                        return (
                                          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1', marginBottom: '12px' }}>
                                              🎭 Sentiment Analysis
                                            </p>
                                            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                                              <strong>Sentiment:</strong> <span style={{ 
                                                color: parsed.sentiment === 'positive' ? '#10b981' : parsed.sentiment === 'negative' ? '#ef4444' : '#f59e0b',
                                                fontWeight: '600'
                                              }}>{parsed.sentiment.toUpperCase()}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                              Positive words: {parsed.positive_words}
                                            </div>
                                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                              Negative words: {parsed.negative_words}
                                            </div>
                                            <div style={{ fontSize: '13px' }}>
                                              Total words: {parsed.total_words}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      // Handle theme analysis
                                      if (typeof parsed === 'object' && parsed.key_themes !== undefined) {
                                        return (
                                          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1', marginBottom: '12px' }}>
                                              📊 Analysis Results
                                            </p>
                                            {parsed.total_words && (
                                              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                <strong>Total words:</strong> {parsed.total_words}
                                              </div>
                                            )}
                                            {parsed.unique_words && (
                                              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                <strong>Unique words:</strong> {parsed.unique_words}
                                              </div>
                                            )}
                                            {parsed.document_count && (
                                              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                                                <strong>Document count:</strong> {parsed.document_count}
                                              </div>
                                            )}
                                            {parsed.total_unique_words && (
                                              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                                                <strong>Total unique words:</strong> {parsed.total_unique_words}
                                              </div>
                                            )}
                                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Key Themes:</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                              {parsed.key_themes.map((theme, idx) => (
                                                <span key={idx} style={{
                                                  padding: '4px 10px',
                                                  background: 'rgba(99, 102, 241, 0.2)',
                                                  borderRadius: '20px',
                                                  fontSize: '12px',
                                                  color: '#6366f1'
                                                }}>
                                                  {typeof theme === 'object' ? theme.word : theme}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      // Handle list results
                                      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].total_pages !== undefined) {
                                        return (
                                          <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#06b6d4', marginBottom: '12px' }}>
                                              📁 Uploaded Documents ({parsed.length})
                                            </p>
                                            {parsed.map((doc, idx) => (
                                              <div key={idx} style={{ marginBottom: '8px', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{doc.filename}</div>
                                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    Pages: {doc.total_pages} | Chunks: {doc.total_chunks}
                                                  </div>
                                                </div>
                                                <div style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '4px' }}>
                                                  {doc.page_range}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      
                                      // Handle general object (like compare with mixed structure)
                                      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                                        return (
                                          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                                            <pre style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                                              {JSON.stringify(parsed, null, 2)}
                                            </pre>
                                          </div>
                                        );
                                      }
                                      
                                    } catch (e) {
                                      // Not JSON, treat as regular text with citations
                                      // Simple markdown parsing
                                      let text = msg.content;
                                      // Bold
                                      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                      // Italic
                                      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                                      // Code
                                      text = text.replace(/`(.*?)`/g, '<code style="background: rgba(59, 130, 246, 0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
                                      // Headers
                                      text = text.replace(/^### (.*$)/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px 0; color: #f8fafc;">$1</h3>');
                                      text = text.replace(/^## (.*$)/gm, '<h2 style="font-size: 18px; font-weight: 600; margin: 20px 0 10px 0; color: #f8fafc;">$1</h2>');
                                      text = text.replace(/^# (.*$)/gm, '<h1 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0; color: #f8fafc;">$1</h1>');
                                      // Lists
                                      text = text.replace(/^\* (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
                                      text = text.replace(/^\+ (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
                                      
                                      return text.split('\n\n').map((part, idx) => {
                                        const citationMatch = part.match(/\[Source: (.*?) \(Page (\d+)\)\]/);
                                        if (citationMatch) {
                                          const [, filename, page] = citationMatch;
                                          const cleanText = part.replace(/\[Source: .*?\(Page \d+\)\]\s*/, '');
                                          return (
                                            <div key={idx} style={{ marginBottom: idx < part.split('\n\n').length - 1 ? '12px' : '0' }}>
                                              <div style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }} dangerouslySetInnerHTML={{ __html: cleanText }} />
                                              <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '6px',
                                                padding: '4px 8px',
                                                background: 'rgba(6, 182, 212, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                color: '#06b6d4',
                                                fontWeight: '500'
                                              }}>
                                                <FileText style={{ width: '12px', height: '12px' }} />
                                                {filename} (Page {page})
                                              </div>
                                            </div>
                                          );
                                        }
                                        return <div key={idx} style={{ marginBottom: idx < part.split('\n\n').length - 1 ? '12px' : '0' }} dangerouslySetInnerHTML={{ __html: part }} />;
                                      });
                                    }
                                  })()}
                                </p>
                              </div>
                            )}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginTop: '12px',
                              paddingTop: '12px',
                              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <span style={{ fontSize: '11px', color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                >
                                  <FileText style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                >
                                  <Activity style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          marginBottom: '24px'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        <div style={{
                          flex: 1,
                          background: 'rgba(16, 185, 129, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '16px',
                          padding: '16px 20px'
                        }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', margin: '0 0 12px 0' }}>
                            📄 Document Summary
                          </p>
                          <div style={{ fontSize: '15px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                            __html: (() => {
                              let text = summary;
                              // Bold
                              text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              // Italic
                              text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                              // Code
                              text = text.replace(/`(.*?)`/g, '<code style="background: rgba(59, 130, 246, 0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
                              // Headers
                              text = text.replace(/^### (.*$)/gm, '<h3 style="font-size: 16px; font-weight: 600; margin: 16px 0 8px 0; color: #f8fafc;">$1</h3>');
                              text = text.replace(/^## (.*$)/gm, '<h2 style="font-size: 18px; font-weight: 600; margin: 20px 0 10px 0; color: #f8fafc;">$1</h2>');
                              text = text.replace(/^# (.*$)/gm, '<h1 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0; color: #f8fafc;">$1</h1>');
                              // Lists
                              text = text.replace(/^\* (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
                              text = text.replace(/^\+ (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
                              return text;
                            })()
                          }} />
                        </div>
                      </motion.div>
                    )}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          marginBottom: '24px'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          borderRadius: '16px',
                          padding: '16px 20px'
                        }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  background: '#3b82f6',
                                  borderRadius: '50%'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  padding: '32px',
                  borderTop: '1px solid rgba(99, 102, 241, 0.08)',
                  background: 'rgba(15, 23, 42, 0.3)',
                  backdropFilter: 'blur(24px)'
                }}
              >
                <div style={{
                  maxWidth: '900px',
                  margin: '0 auto',
                  position: 'relative'
                }}>
                  {/* Prompt Suggestions */}
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {[
                        'Summarize a document',
                        'Generate roadmap',
                        'Explain code',
                        'Analyze data'
                      ].map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setInput(suggestion)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.06)',
                            border: '1px solid rgba(99, 102, 241, 0.12)',
                            borderRadius: '20px',
                            padding: '8px 16px',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    background: 'rgba(99, 102, 241, 0.04)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    borderRadius: '20px',
                    padding: '16px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActiveView('upload');
                      }}
                      style={{
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#6366F1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Paperclip style={{ width: '18px', height: '18px' }} />
                    </motion.button>

                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Message CortexFlow..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '15px',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        lineHeight: '1.6',
                        minHeight: '52px',
                        maxHeight: '150px'
                      }}
                      rows={1}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSummarize}
                      disabled={summarizing}
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#10B981',
                        cursor: 'pointer',
                        marginRight: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Sparkles style={{ width: '18px', height: '18px' }} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      style={{
                        background: input.trim()
                          ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                          : 'rgba(99, 102, 241, 0.08)',
                        border: input.trim() ? 'none' : '1px solid rgba(99, 102, 241, 0.15)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: input.trim() ? 'white' : '#64748b',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: input.trim() ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none'
                      }}
                    >
                      <Send style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    padding: '0 4px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Press Enter to send, Shift+Enter for new line
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {input.length} / 4000
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center',
                  maxWidth: '600px'
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)'
                  }}
                >
                  <Upload style={{ width: '40px', height: '40px', color: 'white' }} />
                </motion.div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '0 0 16px 0'
                }}>
                  Upload Documents
                </h1>
                <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>
                  Drag and drop your PDF files here to build your knowledge base
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: uploading
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 32px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    boxShadow: uploading ? 'none' : '0 0 30px rgba(6, 182, 212, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Browse Files'}
                </motion.button>

                {uploadStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '16px',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      background: uploadStatus.type === 'success'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                      border: uploadStatus.type === 'success'
                        ? '1px solid rgba(16, 185, 129, 0.2)'
                        : '1px solid rgba(239, 68, 68, 0.2)',
                      color: uploadStatus.type === 'success' ? '#10b981' : '#ef4444',
                      fontSize: '14px'
                    }}
                  >
                    {uploadStatus.message}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
