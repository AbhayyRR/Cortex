import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TaskPage() {
  const [taskInput, setTaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskInput.trim()) {
      setMessage('Please enter a task description');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('http://localhost:8000/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskInput }),
      });

      if (response.ok) {
        const result = await response.json();
        setTaskData(result);
        setMessage('Task created successfully!');
        setMessageType('success');
        setTaskInput('');
      } else {
        const error = await response.text();
        setMessage(`Task creation failed: ${error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Task creation failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const checkTaskStatus = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8000/result/${taskId}`);
      
      if (response.ok) {
        const results = await response.json();
        return results;
      } else {
        throw new Error('Failed to fetch task results');
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'running':
        return 'Running';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create New Task
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="task-input" className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              id="task-input"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Describe what you want the AI to do..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              disabled={submitting}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!taskInput.trim() || submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="flex items-center">
                <LoadingSpinner />
                <span className="ml-2">Creating Task...</span>
              </div>
            ) : (
              'Create Task'
            )}
          </button>
        </form>
      </div>

      {taskData && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Task Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Task ID:</span>
              <span className="text-sm text-gray-900">{taskData.task_id}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('pending')}`}>
                {getStatusText('pending')}
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500 block mb-2">Planned Steps:</span>
              <div className="space-y-2">
                {taskData.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Tool: {step.tool}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {step.input}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => checkTaskStatus(taskData.task_id)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
