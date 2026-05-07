import React from 'react';

export default function MemoryPanel({ taskHistory, onLoadTask, onClose }) {
  const formatTaskPreview = (task) => {
    const preview = task.query.length > 50 ? task.query.substring(0, 50) + '...' : task.query;
    return preview;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'running':
        return '⏳';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-80 h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧠</span>
            <h3 className="font-semibold text-gray-100">Memory</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Your conversation history with CortexFlow
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {taskHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400 text-sm">No memories yet</p>
            <p className="text-gray-500 text-xs mt-2">
              Start a conversation and I'll remember it
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {taskHistory.map((task, index) => (
              <div
                key={task.taskId || index}
                onClick={() => onLoadTask(task)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 hover:border-gray-600 transition-all duration-200 group"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(task.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 font-medium leading-relaxed">
                      {formatTaskPreview(task)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors">
                      Load
                    </button>
                  </div>
                </div>

                {/* Task Details */}
                <div className="text-xs text-gray-400 space-y-1">
                  {task.steps && task.steps.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>⚡</span>
                      <span>{task.steps.length} steps executed</span>
                    </div>
                  )}
                  
                  {task.result && (
                    <div className="flex items-center space-x-1">
                      <span>📄</span>
                      <span>Result available</span>
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <span>✅</span>
                      <span>Completed successfully</span>
                    </div>
                  )}

                  {task.status === 'failed' && (
                    <div className="flex items-center space-x-1 text-red-400">
                      <span>❌</span>
                      <span>Failed to complete</span>
                    </div>
                  )}
                </div>

                {/* Result Preview */}
                {task.result && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-300 italic">
                      {task.result.length > 100 
                        ? task.result.substring(0, 100) + '...' 
                        : task.result
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Total conversations:</span>
            <span className="text-gray-300">{taskHistory.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>💡</span>
            <span>Click any conversation to reload it</span>
          </div>
        </div>
      </div>
    </div>
  );
}
