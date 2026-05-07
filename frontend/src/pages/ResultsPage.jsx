import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResultsPage() {
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const fetchResults = async (id) => {
    if (!id.trim()) {
      setError('Please enter a task ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/result/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (data.length === 0) {
          setError('No results found for this task ID');
        }
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch results: ${errorText}`);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchResults(taskId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'running':
        return '⏳';
      case 'pending':
        return '⏸';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getToolIcon = (tool) => {
    switch (tool) {
      case 'retrieve':
        return '🔍';
      case 'summarize':
        return '📝';
      case 'general':
        return '🤖';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          View Task Results
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="task-id" className="block text-sm font-medium text-gray-700 mb-2">
                Task ID
              </label>
              <input
                id="task-id"
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter task ID (e.g., 1)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!taskId.trim() || loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : (
                  'Get Results'
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Task Results - ID: {taskId}
          </h3>
          
          <div className="space-y-6">
            {results.map((subtask, index) => (
              <div key={subtask.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getToolIcon(subtask.tool)}</span>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {subtask.tool.charAt(0).toUpperCase() + subtask.tool.slice(1)}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Step: {subtask.step}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor('completed')}`}>
                    {getStatusIcon('completed')} Completed
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Result:</h5>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {subtask.result || 'No result available'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Total Steps: {results.length}
              </div>
              <button
                onClick={() => fetchResults(taskId)}
                className="px-4 py-2 text-sm font-medium text-primary bg-primary bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors"
              >
                Refresh Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
