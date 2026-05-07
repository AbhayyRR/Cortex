// Test component connectivity and state management
import { useState } from 'react';

export default function TestConnectivity() {
  const [activeView, setActiveView] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);

  const addMessage = (message) => {
    console.log('Adding message:', message);
    setMessages(prev => [...prev, message]);
  };

  const addTaskToHistory = (task) => {
    console.log('Adding task to history:', task);
    setTaskHistory(prev => [task, ...prev].slice(0, 50));
  };

  const showToast = (message, type = 'info') => {
    console.log('Toast notification:', message, type);
  };

  // Test state changes
  const testStateChange = () => {
    console.log('Testing state changes...');
    setActiveView('upload');
    setTimeout(() => setActiveView('chat'), 1000);
  };

  // Test message flow
  const testMessageFlow = () => {
    console.log('Testing message flow...');
    addMessage({ type: 'user', content: 'Test message' });
    setTimeout(() => {
      addMessage({ type: 'assistant', content: 'Test response' });
    }, 500);
  };

  // Test task creation
  const testTaskCreation = () => {
    console.log('Testing task creation...');
    const testTask = {
      taskId: 'test-123',
      query: 'Test query',
      status: 'running',
      steps: [{ tool: 'retrieve', input: 'test input' }],
      timestamp: new Date().toISOString()
    };
    setCurrentTask(testTask);
    addTaskToHistory(testTask);
  };

  return (
    <div className="p-8 bg-dark-bg text-dark-text">
      <h2 className="text-2xl font-bold mb-6">Connectivity Test</h2>
      
      <div className="space-y-4">
        <div className="bg-dark-surface p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current State:</h3>
          <p>Active View: {activeView}</p>
          <p>Messages: {messages.length}</p>
          <p>Current Task: {currentTask ? currentTask.taskId : 'None'}</p>
          <p>Task History: {taskHistory.length}</p>
        </div>

        <div className="space-x-4">
          <button 
            onClick={testStateChange}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Test View Switch
          </button>
          <button 
            onClick={testMessageFlow}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Test Message Flow
          </button>
          <button 
            onClick={testTaskCreation}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Test Task Creation
          </button>
        </div>

        <div className="bg-dark-surface p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Messages:</h3>
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <strong>{msg.type}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
