import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#7f1d1d',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '24px',
          margin: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>💥</span>
          <h2 style={{
            color: '#fca5a5',
            margin: '0 0 12px 0',
            fontSize: '20px'
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: '#fca5a5',
            margin: '0 0 20px 0',
            fontSize: '14px'
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{
              backgroundColor: '#7f1d1d',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0',
              textAlign: 'left'
            }}>
              <summary style={{
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Error Details
              </summary>
              <pre style={{
                color: '#fca5a5',
                fontSize: '12px',
                margin: '12px 0 0 0',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
