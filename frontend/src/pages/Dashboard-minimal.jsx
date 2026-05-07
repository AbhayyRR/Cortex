import { useState } from 'react';

export default function DashboardMinimal() {
  const [activeView, setActiveView] = useState('chat');

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', 
      color: '#e5e5e5', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '16px',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>CortexFlow</h1>
      </div>
      
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          width: '200px',
          padding: '16px',
          borderRight: '1px solid #2a2a2a'
        }}>
          <button 
            onClick={() => setActiveView('chat')}
            style={{ 
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: activeView === 'chat' ? '#3b82f6' : '#2a2a2a',
              color: '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveView('upload')}
            style={{ 
              display: 'block',
              width: '100%',
              padding: '8px',
              backgroundColor: activeView === 'upload' ? '#3b82f6' : '#2a2a2a',
              color: '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Upload
          </button>
        </div>
        
        <div style={{ flex: 1, padding: '20px' }}>
          {activeView === 'chat' ? (
            <div>
              <h2>Chat Interface</h2>
              <p>Chat functionality would go here</p>
            </div>
          ) : (
            <div>
              <h2>Upload Interface</h2>
              <p>Upload functionality would go here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
