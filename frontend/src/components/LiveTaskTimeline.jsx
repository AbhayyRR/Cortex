import React from 'react';

const getStepIcon = (step) => {
  switch (step) {
    case 'planning':
      return '🧠';
    case 'retrieve':
      return '🔍';
    case 'summarize':
      return '📝';
    case 'general':
      return '🤖';
    case 'executing':
      return '⚡';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    default:
      return '⚙️';
  }
};

const getStepColor = (status) => {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-900 border-green-700';
    case 'running':
      return 'text-blue-400 bg-blue-900 border-blue-700';
    case 'failed':
      return 'text-red-400 bg-red-900 border-red-700';
    case 'pending':
    default:
      return 'text-gray-400 bg-gray-800 border-gray-700';
  }
};

const getStepMessage = (step, status) => {
  const messages = {
    planning: {
      running: "Planning your task...",
      completed: "Task planned successfully",
      failed: "Planning failed"
    },
    retrieve: {
      running: "Retrieving relevant documents...",
      completed: "Documents retrieved",
      failed: "Failed to retrieve documents"
    },
    summarize: {
      running: "Summarizing content...",
      completed: "Content summarized",
      failed: "Summarization failed"
    },
    general: {
      running: "Processing with AI...",
      completed: "AI processing complete",
      failed: "AI processing failed"
    },
    executing: {
      running: "Executing task...",
      completed: "Task executed",
      failed: "Task execution failed"
    }
  };

  return messages[step]?.[status] || `${step} - ${status}`;
};

export default function LiveTaskTimeline({ currentTask, currentResult, isExecuting, isPolling }) {
  if (!currentTask && !isExecuting) {
    return null;
  }

  // Build timeline steps based on current task and result
  const buildTimeline = () => {
    const steps = [];

    // Always start with planning
    steps.push({
      id: 'planning',
      name: 'Planning',
      status: currentTask ? 'completed' : 'running',
      message: getStepMessage('planning', currentTask ? 'completed' : 'running'),
      timestamp: currentTask?.timestamp
    });

    // Add steps from task execution
    if (currentResult?.steps) {
      currentResult.steps.forEach((step, index) => {
        const stepName = step.tool || 'executing';
        const stepStatus = step.result ? 'completed' : (step.status === 'failed' ? 'failed' : 'running');
        
        steps.push({
          id: `step-${index}`,
          name: stepName.charAt(0).toUpperCase() + stepName.slice(1),
          status: stepStatus,
          message: getStepMessage(stepName, stepStatus),
          input: step.input,
          result: step.result,
          timestamp: step.timestamp
        });
      });
    } else if (isPolling) {
      // Show placeholder steps while polling
      steps.push({
        id: 'retrieve',
        name: 'Retrieve',
        status: 'running',
        message: getStepMessage('retrieve', 'running'),
        timestamp: new Date().toISOString()
      });
    }

    // Add final step if completed
    if (currentResult?.status === 'completed') {
      steps.push({
        id: 'completed',
        name: 'Completed',
        status: 'completed',
        message: 'Task completed successfully',
        timestamp: new Date().toISOString()
      });
    }

    return steps;
  };

  const timeline = buildTimeline();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
          <span className="text-lg">⚡</span>
          <span>Live Task Execution</span>
        </h3>
        <div className="flex items-center space-x-2">
          {(isPolling || isExecuting) && (
            <div className="flex items-center space-x-1 text-xs text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Processing</span>
            </div>
          )}
          {currentResult?.status === 'completed' && (
            <div className="flex items-center space-x-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {timeline.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${getStepColor(step.status)}`}>
                {step.status === 'running' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  getStepIcon(step.name.toLowerCase())
                )}
              </div>
              {index < timeline.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${step.status === 'completed' ? 'bg-green-700' : 'bg-gray-700'}`}></div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-200">{step.name}</h4>
                {step.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-400 mt-1">{step.message}</p>
              
              {step.input && (
                <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300">
                  <span className="text-gray-500">Input: </span>
                  {step.input.length > 100 ? step.input.substring(0, 100) + '...' : step.input}
                </div>
              )}
              
              {step.result && (
                <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300">
                  <span className="text-gray-500">Result: </span>
                  {step.result.length > 100 ? step.result.substring(0, 100) + '...' : step.result}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      {isPolling && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Executing your request...</span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
