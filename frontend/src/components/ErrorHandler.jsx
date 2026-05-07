import React from 'react';
import { ErrorTypes, APIError } from '../services/api';

// Error message mapping
const getErrorMessage = (error) => {
  if (error instanceof APIError) {
    switch (error.type) {
      case ErrorTypes.NETWORK:
        return 'Network connection failed. Please check your internet connection and try again.';
      case ErrorTypes.TIMEOUT:
        return 'Request timed out. The task is taking longer than expected. Please try again.';
      case ErrorTypes.VALIDATION:
        return error.message;
      case ErrorTypes.API:
        return `Server error: ${error.message}`;
      case ErrorTypes.TASK_FAILED:
        return 'Task execution failed. Please check your input and try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error?.name === 'TypeError') {
    return 'Network error. Please check your connection and try again.';
  }

  return error?.message || 'An unexpected error occurred.';
};

// Error severity levels
const getErrorSeverity = (error) => {
  if (error instanceof APIError) {
    switch (error.type) {
      case ErrorTypes.VALIDATION:
        return 'warning';
      case ErrorTypes.NETWORK:
      case ErrorTypes.TIMEOUT:
        return 'error';
      case ErrorTypes.API:
        return error.statusCode >= 500 ? 'error' : 'warning';
      default:
        return 'error';
    }
  }

  return 'error';
};

// Error colors and icons
const getErrorConfig = (severity) => {
  switch (severity) {
    case 'warning':
      return {
        bgColor: '#92400e',
        borderColor: '#f59e0b',
        textColor: '#fde68a',
        icon: '⚠️'
      };
    case 'error':
    default:
      return {
        bgColor: '#7f1d1d',
        borderColor: '#ef4444',
        textColor: '#fca5a5',
        icon: '❌'
      };
  }
};

export default function ErrorHandler({ error, onRetry, onDismiss, showRetry = true }) {
  if (!error) return null;

  const message = getErrorMessage(error);
  const severity = getErrorSeverity(error);
  const config = getErrorConfig(severity);

  return (
    <div style={{
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px', flexShrink: 0 }}>{config.icon}</span>
      
      <div style={{ flex: 1 }}>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: config.textColor,
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        
        {/* Additional error details for development */}
        {process.env.NODE_ENV === 'development' && error instanceof APIError && (
          <details style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            padding: '8px',
            marginTop: '8px'
          }}>
            <summary style={{
              color: config.textColor,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Debug Info
            </summary>
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: config.textColor,
              fontFamily: 'monospace'
            }}>
              <div>Type: {error.type}</div>
              {error.statusCode && <div>Status: {error.statusCode}</div>}
              {error.details && (
                <div>Details: {JSON.stringify(error.details, null, 2)}</div>
              )}
            </div>
          </details>
        )}
        
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              style={{
                backgroundColor: config.borderColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Retry
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                backgroundColor: 'transparent',
                color: config.textColor,
                border: `1px solid ${config.borderColor}`,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast error handler for quick notifications
export const ErrorToast = ({ error, onDismiss }) => {
  if (!error) return null;

  const message = getErrorMessage(error);
  const severity = getErrorSeverity(error);
  const config = getErrorConfig(severity);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '8px',
      padding: '12px 16px',
      color: config.textColor,
      fontSize: '14px',
      maxWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <span>{config.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: config.textColor,
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
