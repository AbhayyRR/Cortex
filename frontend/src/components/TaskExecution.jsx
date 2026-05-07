import React from 'react';

// Step status icons and colors
const getStatusConfig = (status) => {
  switch (status) {
    case 'completed':
      return {
        icon: '✓',
        color: '#10b981',
        bgColor: '#10b98120',
        borderColor: '#10b981',
        label: 'Completed'
      };
    case 'running':
      return {
        icon: '⏳',
        color: '#3b82f6',
        bgColor: '#3b82f620',
        borderColor: '#3b82f6',
        label: 'Running'
      };
    case 'failed':
      return {
        icon: '✗',
        color: '#ef4444',
        bgColor: '#ef444420',
        borderColor: '#ef4444',
        label: 'Failed'
      };
    case 'pending':
    default:
      return {
        icon: '⏸',
        color: '#6b7280',
        bgColor: '#6b728020',
        borderColor: '#6b7280',
        label: 'Pending'
      };
  }
};

// Tool icons
const getToolIcon = (tool) => {
  switch (tool) {
    case 'retrieve':
      return '🔍';
    case 'summarize':
      return '📝';
    case 'general':
      return '🤖';
    case 'planner':
      return '🧠';
    default:
      return '⚙️';
  }
};

// Tool descriptions
const getToolDescription = (tool) => {
  switch (tool) {
    case 'retrieve':
      return 'Retrieving relevant information from documents';
    case 'summarize':
      return 'Summarizing content and extracting key points';
    case 'general':
      return 'Processing with general AI capabilities';
    case 'planner':
      return 'Planning task execution steps';
    default:
      return 'Executing task';
  }
};

// Individual step component
const StepItem = ({ step, index, isActive, totalSteps }) => {
  const statusConfig = getStatusConfig(step.status);
  const toolIcon = getToolIcon(step.tool);
  const isLastStep = index === totalSteps - 1;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: isLastStep ? '0' : '16px',
      opacity: step.status === 'pending' ? 0.6 : 1,
      animation: step.status === 'running' ? 'pulse 2s infinite' : 'none'
    }}>
      {/* Step indicator */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: '16px',
        position: 'relative'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: statusConfig.bgColor,
          border: `2px solid ${statusConfig.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: statusConfig.color,
          position: 'relative',
          zIndex: 2
        }}>
          {step.status === 'running' ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid',
              borderColor: statusConfig.color,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            statusConfig.icon
          )}
        </div>
        
        {/* Connection line */}
        {!isLastStep && (
          <div style={{
            width: '2px',
            height: '40px',
            backgroundColor: step.status === 'completed' ? statusConfig.color : '#374151',
            marginTop: '8px'
          }}></div>
        )}
      </div>

      {/* Step content */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>{toolIcon}</span>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#e5e5e5'
          }}>
            {step.tool.charAt(0).toUpperCase() + step.tool.slice(1)}
          </h4>
          <span style={{
            fontSize: '12px',
            color: statusConfig.color,
            backgroundColor: statusConfig.bgColor,
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {statusConfig.label}
          </span>
        </div>

        <p style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#a0a0a0',
          lineHeight: '1.4'
        }}>
          {getToolDescription(step.tool)}
        </p>

        {step.input && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }}>
              Input: {step.input}
            </p>
          </div>
        )}

        {step.result && (
          <div style={{
            backgroundColor: '#065f46',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#e5e5e5',
              whiteSpace: 'pre-wrap'
            }}>
              {step.result}
            </p>
          </div>
        )}

        {step.error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#fca5a5'
            }}>
              Error: {step.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main task execution component
export default function TaskExecution({ 
  steps = [], 
  currentStatus = 'pending',
  loading = false,
  error = null,
  result = null 
}) {
  if (loading && steps.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #374151',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          color: '#e5e5e5'
        }}>
          Initializing Task...
        </h3>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#a0a0a0'
        }}>
          Setting up execution environment
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#7f1d1d',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>❌</span>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            color: '#fca5a5'
          }}>
            Task Execution Failed
          </h3>
        </div>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#fca5a5'
        }}>
          {error.message || 'An unexpected error occurred during task execution'}
        </p>
      </div>
    );
  }

  if (result && currentStatus === 'completed') {
    return (
      <div style={{
        backgroundColor: '#065f46',
        border: '1px solid #10b981',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>✅</span>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            color: '#86efac'
          }}>
            Task Completed Successfully
          </h3>
        </div>
        <div style={{
          backgroundColor: '#064e3b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#86efac'
          }}>
            Final Result:
          </h4>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#e5e5e5',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>
            {result}
          </p>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Completed at: {new Date().toLocaleString()}
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}>🤖</span>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          color: '#e5e5e5'
        }}>
          Ready to Execute Tasks
        </h3>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#a0a0a0'
        }}>
          Submit a query to see task execution steps
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          color: '#e5e5e5',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🔄</span>
          Task Execution Progress
        </h3>
        <div style={{
          fontSize: '14px',
          color: currentStatus === 'running' ? '#3b82f6' : '#a0a0a0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {currentStatus === 'running' && (
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
          )}
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
      </div>

      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '8px'
      }}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id || index}
            step={step}
            index={index}
            isActive={step.status === 'running'}
            totalSteps={steps.length}
          />
        ))}
      </div>

      {currentStatus === 'running' && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #374151',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#a0a0a0'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite'
            }}></div>
            <div style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.2s'
            }}></div>
            <div style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.4s'
            }}></div>
            <span style={{ marginLeft: '8px' }}>Processing task...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
