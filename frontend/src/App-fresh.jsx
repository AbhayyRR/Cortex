import React from 'react';

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', color: '#3b82f6', marginBottom: '20px' }}>
        🚀 FRESH TEST
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '20px' }}>
        This is a completely fresh React component
      </p>
      <div style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        If you see this, React is working perfectly!
      </div>
    </div>
  );
}

export default App;
