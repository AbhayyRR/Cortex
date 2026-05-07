import { useEffect } from 'react';
import Dashboard from './pages/Dashboard-Working';

function App() {
  useEffect(() => {
    console.log('🚀 CortexFlow App Mounted');
    document.body.style.backgroundColor = '#0a0a0a';
    document.body.style.color = '#e5e5e5';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
  }, []);

  return <Dashboard />;
}

export default App;
