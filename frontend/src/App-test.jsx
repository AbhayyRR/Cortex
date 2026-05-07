import { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('🚀 App component mounted');
    document.body.style.backgroundColor = '#0a0a0a';
    document.body.style.color = '#e5e5e5';
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', 
      color: '#e5e5e5', 
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1>CortexFlow Test</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

export default App;
