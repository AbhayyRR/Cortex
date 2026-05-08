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
    document.body.style.backgroundColor = '#0a0a0f';
    document.body.style.color = '#f8fafc';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
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
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #0f172a 50%, #1e293b 75%, #0f172a 100%)',
      color: '#f8fafc',
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          width: '320px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(59, 130, 246, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Bot style={{ width: '28px', height: '28px', color: 'white' }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                CortexFlow
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                AI Assistant
              </p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px', flex: 1 }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '0.05em'
          }}>
            Navigation
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('chat')}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeView === 'chat' 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' 
                : 'transparent',
              color: activeView === 'chat' ? '#f8fafc' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
              border: activeView === 'chat' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare style={{ width: '20px', height: '20px' }} />
            <span style={{ fontWeight: '500' }}>AI Chat</span>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('upload')}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeView === 'upload' 
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                : 'transparent',
              color: activeView === 'upload' ? '#f8fafc' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
              border: activeView === 'upload' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload style={{ width: '20px', height: '20px' }} />
            <span style={{ fontWeight: '500' }}>Upload</span>
            {activeView === 'upload' && (
              <motion.div
                layout
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#06b6d4',
                  borderRadius: '50%',
                  marginLeft: 'auto',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                }}
              />
            )}
          </motion.button>

          {/* Recent Conversations */}
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            marginTop: '24px',
            marginBottom: '12px',
            letterSpacing: '0.05em'
          }}>
            Recent
          </h3>
          
          {messages.length === 0 ? (
            <div style={{
              padding: '20px',
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px dashed rgba(59, 130, 246, 0.2)'
            }}>
              <MessageSquare style={{ width: '32px', height: '32px', color: '#6b7280', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
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
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.05)',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <p style={{
                  fontSize: '13px',
                  color: '#f8fafc',
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

        {/* System Status */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '0.05em'
          }}>
            System Status
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div style={{
              padding: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                }} />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>AI</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>Online</span>
            </div>

            <div style={{
              padding: '10px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Brain style={{ width: '10px', height: '10px', color: '#3b82f6' }} />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Memory</span>
              </div>
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>Active</span>
            </div>

            <div style={{
              padding: '10px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Cpu style={{ width: '10px', height: '10px', color: '#8b5cf6' }} />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Model</span>
              </div>
              <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600' }}>GPT-4</span>
            </div>

            <div style={{
              padding: '10px',
              background: 'rgba(6, 182, 212, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap style={{ width: '10px', height: '10px', color: '#06b6d4' }} />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Speed</span>
              </div>
              <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '600' }}>&lt;1s</span>
            </div>
          </div>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              transition: 'all 0.2s ease'
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
              <User style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>User</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>Pro Plan</p>
            </div>
            <ChevronRight style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '320px' : '0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)',
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
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
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
              gap: '16px'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }} />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>Online</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <Settings style={{ width: '20px', height: '20px' }} />
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
                padding: '24px'
              }}>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      maxWidth: '800px',
                      margin: '0 auto',
                      textAlign: 'center',
                      padding: '60px 20px'
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
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px',
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
                    </motion.div>

                    <h1 style={{
                      fontSize: '48px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      margin: '0 0 16px 0'
                    }}>
                      Welcome to CortexFlow
                    </h1>
                    <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '48px' }}>
                      Your intelligent AI assistant powered by advanced language models
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      maxWidth: '800px',
                      margin: '0 auto'
                    }}>
                      {[
                        { icon: FileText, title: 'Upload Documents', desc: 'Build your knowledge base' },
                        { icon: MessageSquare, title: 'Ask Questions', desc: 'Get detailed answers' },
                        { icon: Brain, title: 'Memory Context', desc: 'Remembers conversations' },
                        { icon: Zap, title: 'Real-time Updates', desc: 'Live task execution' }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          style={{
                            padding: '24px',
                            background: 'rgba(59, 130, 246, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <item.icon style={{ width: '32px', height: '32px', color: '#3b82f6', marginBottom: '12px' }} />
                          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>{item.title}</h3>
                          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
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
                                      // Try to parse as JSON (for retrieve results with confidence)
                                      const parsed = JSON.parse(msg.content);
                                      if (Array.isArray(parsed)) {
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
                  padding: '24px',
                  borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{
                  maxWidth: '800px',
                  margin: '0 auto',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    background: 'rgba(59, 130, 246, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '16px',
                    padding: '12px',
                    transition: 'all 0.3s ease'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActiveView('upload');
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        color: '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <Paperclip style={{ width: '20px', height: '20px' }} />
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
                        minHeight: '44px',
                        maxHeight: '120px'
                      }}
                      rows={1}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSummarize}
                      disabled={summarizing}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#10b981',
                        cursor: 'pointer',
                        marginRight: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Sparkles style={{ width: '20px', height: '20px' }} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      style={{
                        background: input.trim()
                          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                          : 'rgba(59, 130, 246, 0.1)',
                        border: input.trim()
                          ? '1px solid rgba(59, 130, 246, 0.3)'
                          : '1px solid rgba(59, 130, 246, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: input.trim() ? 'white' : '#94a3b8',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        boxShadow: input.trim() ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Send style={{ width: '20px', height: '20px' }} />
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
