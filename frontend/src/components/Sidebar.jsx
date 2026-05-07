import { useState } from 'react';

export default function Sidebar({ activeView, setActiveView, taskHistory, setCurrentTask, setMessages }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔧 Sidebar State:', { activeView, isCollapsed, taskHistory: taskHistory.length });
  }, [activeView, isCollapsed, taskHistory]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'running':
        return '⏳';
      case 'pending':
        return '⏸';
      case 'failed':
        return '✗';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'running':
        return 'text-yellow-500';
      case 'pending':
        return 'text-gray-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const loadTask = (task) => {
    console.log('🔄 Loading task from history:', task);
    setCurrentTask(task);
    setMessages(task.messages || []);
    setActiveView('chat');
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      borderRight: '1px solid #2a2a2a',
      transition: 'all 0.3s',
      width: isCollapsed ? '64px' : '320px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!isCollapsed && (
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>CortexFlow</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{ 
                padding: '8px', 
                borderRadius: '8px', 
                backgroundColor: 'transparent',
                border: 'none',
                color: '#e5e5e5',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => {
                console.log('🔄 Switching to chat view');
                setActiveView('chat');
              }}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                padding: '12px 16px', 
                borderRadius: '8px',
                backgroundColor: activeView === 'chat' ? '#3b82f6' : 'transparent',
                color: activeView === 'chat' ? 'white' : '#e5e5e5',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {!isCollapsed && <span>AI Chat</span>}
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                console.log('🔄 Switching to upload view');
                setActiveView('upload');
              }}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                padding: '12px 16px', 
                borderRadius: '8px',
                backgroundColor: activeView === 'upload' ? '#3b82f6' : 'transparent',
                color: activeView === 'upload' ? 'white' : '#e5e5e5',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {!isCollapsed && <span>Upload PDF</span>}
            </button>
          </div>
        </div>

        {/* Task History */}
        {!isCollapsed && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#a0a0a0', marginBottom: '12px' }}>Recent Tasks</h3>
            <div>
              {taskHistory.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#a0a0a0' }}>No tasks yet</p>
              ) : (
                taskHistory.map((task) => (
                  <div
                    key={task.taskId}
                    onClick={() => loadTask(task)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #2a2a2a',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#2a2a2a';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.query}
                        </p>
                        <p style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
                          {new Date(task.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span style={{ fontSize: '14px', marginLeft: '8px', color: getStatusColor(task.status).replace('text-', '#') }}>
                        {getStatusIcon(task.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            {!isCollapsed && (
              <span style={{ fontSize: '12px', color: '#a0a0a0' }}>System Online</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
