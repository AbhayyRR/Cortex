export default function StepTimeline({ steps, status }) {
  const getStepIcon = (tool) => {
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

  const getStepStatus = (step, index, currentStatus) => {
    if (currentStatus === 'failed') return 'error';
    if (currentStatus === 'planning') return index === 0 ? 'running' : 'pending';
    if (currentStatus === 'running') {
      if (step.result) return 'completed';
      if (index === 0) return 'running';
      return 'pending';
    }
    return 'pending';
  };

  const getStatusColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'running':
        return 'bg-yellow-500 border-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-dark-border border-dark-border';
    }
  };

  const getStatusText = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'Completed';
      case 'running':
        return 'Running...';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getStepDescription = (tool, input) => {
    switch (tool) {
      case 'retrieve':
        return `Retrieving relevant information: "${input}"`;
      case 'summarize':
        return `Summarizing content: "${input}"`;
      case 'general':
        return `Processing: "${input}"`;
      default:
        return `${tool}: ${input}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-text">Task Execution</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'running' ? 'bg-yellow-500/20 text-yellow-500' :
          status === 'completed' ? 'bg-green-500/20 text-green-500' :
          status === 'failed' ? 'bg-red-500/20 text-red-500' :
          'bg-gray-500/20 text-gray-500'
        }`}>
          {status === 'planning' && 'Planning...'}
          {status === 'running' && 'Executing...'}
          {status === 'completed' && 'Completed'}
          {status === 'failed' && 'Failed'}
        </div>
      </div>

      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-dark-textSecondary">Initializing task...</p>
          </div>
        ) : (
          steps.map((step, index) => {
            const stepStatus = getStepStatus(step, index, status);
            
            return (
              <div 
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 ${
                  stepStatus === 'running' 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : stepStatus === 'completed'
                    ? 'border-green-500 bg-green-500/10'
                    : stepStatus === 'error'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-dark-border bg-dark-surface'
                } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${getStatusColor(stepStatus)}`}>
                    {stepStatus === 'running' ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : stepStatus === 'completed' ? (
                      '✓'
                    ) : stepStatus === 'error' ? (
                      '✗'
                    ) : (
                      getStepIcon(step.tool)
                    )}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-dark-text capitalize">
                      {step.tool}
                    </h4>
                    <span className={`text-xs font-medium ${
                      stepStatus === 'running' ? 'text-yellow-500' :
                      stepStatus === 'completed' ? 'text-green-500' :
                      stepStatus === 'error' ? 'text-red-500' :
                      'text-dark-textSecondary'
                    }`}>
                      {getStatusText(stepStatus)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-dark-textSecondary mb-2">
                    {getStepDescription(step.tool, step.input)}
                  </p>

                  {step.result && (
                    <div className="bg-dark-bg rounded-lg p-3 border border-dark-border">
                      <p className="text-sm text-dark-text">
                        {step.result}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {status === 'running' && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-sm text-dark-textSecondary">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Processing your request...</span>
          </div>
        </div>
      )}
    </div>
  );
}
