const API_BASE_URL = 'http://localhost:8000';

// Error types for better handling
export const ErrorTypes = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  API: 'api',
  VALIDATION: 'validation',
  TASK_FAILED: 'task_failed'
};

// Custom error class
export class APIError extends Error {
  constructor(type, message, statusCode = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Timeout helper
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new APIError(ErrorTypes.TIMEOUT, `Request timed out after ${ms}ms`)), ms);
  });
};

// Request wrapper with error handling
const makeRequest = async (url, options = {}, timeout = 30000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If JSON parsing fails, try text
        try {
          errorMessage = await response.text();
        } catch {
          // Use default error message
        }
      }

      throw new APIError(ErrorTypes.API, errorMessage, response.status, errorDetails);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new APIError(ErrorTypes.TIMEOUT, 'Request was aborted due to timeout');
    }
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new APIError(ErrorTypes.NETWORK, 'Network connection failed');
    }
    throw new APIError(ErrorTypes.API, error.message);
  }
};

export const api = {
  // Upload PDF file
  uploadFile: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await makeRequest(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      }, 60000); // 60 second timeout for file uploads

      return await response.json();
    } catch (error) {
      if (error.type === ErrorTypes.API && error.statusCode === 413) {
        throw new APIError(ErrorTypes.VALIDATION, 'File too large. Please upload a smaller file.');
      }
      if (error.type === ErrorTypes.API && error.statusCode === 422) {
        throw new APIError(ErrorTypes.VALIDATION, 'Invalid file format. Please upload a PDF file.');
      }
      throw error;
    }
  },

  // Create task
  createTask: async (task) => {
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      throw new APIError(ErrorTypes.VALIDATION, 'Task description cannot be empty');
    }

    if (task.length > 10000) {
      throw new APIError(ErrorTypes.VALIDATION, 'Task description is too long (max 10,000 characters)');
    }

    try {
      const response = await makeRequest(`${API_BASE_URL}/task`, {
        method: 'POST',
        body: JSON.stringify({ task: task.trim() })
      });

      const result = await response.json();
      
      // Validate response structure
      if (!result.task_id) {
        throw new APIError(ErrorTypes.API, 'Invalid response: missing task_id');
      }

      return {
        task_id: result.task_id,
        steps: result.steps || [],
        status: result.status || 'pending'
      };
    } catch (error) {
      throw error;
    }
  },

  // Get task result with polling support
  getResult: async (taskId, maxAttempts = 150) => { // 5 minutes max with 2s intervals
    if (!taskId || typeof taskId !== 'string') {
      throw new APIError(ErrorTypes.VALIDATION, 'Invalid task ID');
    }

    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await makeRequest(`${API_BASE_URL}/result/${taskId}`, {}, 10000);
        const result = await response.json();

        // Handle different response formats
        const processedResult = Array.isArray(result) ? result : [result];
        
        // Check if task is completed or failed
        const hasResults = processedResult.some(r => r.result);
        const allCompleted = processedResult.every(r => r.result);
        const hasFailed = processedResult.some(r => r.status === 'failed');

        if (allCompleted) {
          return {
            status: 'completed',
            steps: processedResult,
            result: processedResult[processedResult.length - 1]?.result || 'Task completed successfully'
          };
        }

        if (hasFailed) {
          return {
            status: 'failed',
            steps: processedResult,
            result: processedResult.find(r => r.status === 'failed')?.result || 'Task failed during execution'
          };
        }

        // Task still running, return current status
        return {
          status: 'running',
          steps: processedResult,
          result: null
        };

      } catch (error) {
        if (error.type === ErrorTypes.TIMEOUT) {
          throw error;
        }
        
        if (error.type === ErrorTypes.API && error.statusCode === 404) {
          throw new APIError(ErrorTypes.VALIDATION, 'Task not found');
        }

        // For other errors, wait and retry
        attempts++;
        if (attempts >= maxAttempts) {
          throw new APIError(ErrorTypes.TIMEOUT, 'Task polling timeout - task took too long to complete');
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new APIError(ErrorTypes.TIMEOUT, 'Task polling timeout - maximum attempts reached');
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await makeRequest(`${API_BASE_URL}/docs`, {}, 5000);
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new APIError(ErrorTypes.NETWORK, 'Backend server is not accessible');
    }
  },

  // Utility method to validate task status
  isTaskComplete: (result) => {
    return result && (result.status === 'completed' || result.status === 'failed');
  },

  // Utility method to extract steps from result
  extractSteps: (result) => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: index,
      tool: step.tool || 'unknown',
      input: step.input || '',
      status: step.result ? 'completed' : (step.status || 'pending'),
      result: step.result || null,
      error: step.error || null
    }));
  }
};
