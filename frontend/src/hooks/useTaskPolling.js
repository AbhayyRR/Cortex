import { useState, useEffect, useRef, useCallback } from 'react';
import { api, ErrorTypes, APIError } from '../services/api';

export const useTaskPolling = (taskId, onResult, onError, onComplete) => {
  const [isPolling, setIsPolling] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(async (taskIdToPoll) => {
    if (!taskIdToPoll) {
      throw new APIError(ErrorTypes.VALIDATION, 'Task ID is required for polling');
    }

    setIsPolling(true);
    setError(null);
    setAttempts(0);

    const poll = async () => {
      try {
        const result = await api.getResult(taskIdToPoll);
        
        if (!isMountedRef.current) return;

        setAttempts(prev => prev + 1);
        setCurrentResult(result);
        setError(null);

        // Call result callback
        if (onResult) {
          onResult(result);
        }

        // Check if task is complete
        if (api.isTaskComplete(result)) {
          stopPolling();
          
          if (onComplete) {
            onComplete(result);
          }
          
          return;
        }

        // Continue polling if task is still running
        if (result.status === 'running') {
          pollIntervalRef.current = setTimeout(poll, 2000);
        } else {
          // Unexpected status, stop polling
          stopPolling();
          
          if (onError) {
            onError(new APIError(ErrorTypes.API, `Unexpected task status: ${result.status}`));
          }
        }

      } catch (err) {
        if (!isMountedRef.current) return;

        console.error('Polling error:', err);
        setError(err);
        
        if (onError) {
          onError(err);
        }

        // Stop polling on error
        stopPolling();
      }
    };

    // Start polling immediately
    await poll();
  }, [onResult, onError, onComplete, stopPolling]);

  // Auto-start when taskId changes
  useEffect(() => {
    if (taskId && !isPolling) {
      startPolling(taskId);
    }

    return () => {
      stopPolling();
    };
  }, [taskId, startPolling, stopPolling, isPolling]);

  return {
    isPolling,
    currentResult,
    error,
    attempts,
    startPolling,
    stopPolling
  };
};

// Hook for task management with full lifecycle
export const useTaskManager = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // Load task history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taskHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTaskHistory(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load task history:', err);
    }
  }, []);

  // Save task history to localStorage
  const saveTaskHistory = useCallback((history) => {
    try {
      localStorage.setItem('taskHistory', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save task history:', err);
    }
  }, []);

  const addToHistory = useCallback((task) => {
    const newTask = {
      ...task,
      timestamp: new Date().toISOString()
    };
    
    setTaskHistory(prev => {
      const updated = [newTask, ...prev].slice(0, 50); // Keep last 50 tasks
      saveTaskHistory(updated);
      return updated;
    });
  }, [saveTaskHistory]);

  const createTask = useCallback(async (taskDescription) => {
    try {
      setError(null);
      setIsExecuting(true);

      // Create task via API
      const taskResponse = await api.createTask(taskDescription);

      const task = {
        taskId: taskResponse.task_id,
        query: taskDescription,
        status: 'running',
        steps: taskResponse.steps || [],
        timestamp: new Date().toISOString()
      };

      setCurrentTask(task);
      addToHistory(task);

      return task;

    } catch (err) {
      console.error('Task creation failed:', err);
      setError(err);
      setIsExecuting(false);
      throw err;
    }
  }, [addToHistory]);

  const updateTaskStatus = useCallback((result) => {
    if (!currentTask) return;

    const updatedTask = {
      ...currentTask,
      status: result.status,
      steps: api.extractSteps(result),
      result: result.result,
      completedAt: new Date().toISOString()
    };

    setCurrentTask(updatedTask);

    // Update in history
    setTaskHistory(prev => {
      const updated = prev.map(task => 
        task.taskId === updatedTask.taskId ? updatedTask : task
      );
      saveTaskHistory(updated);
      return updated;
    });

    if (result.status === 'completed' || result.status === 'failed') {
      setIsExecuting(false);
    }
  }, [currentTask, saveTaskHistory]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetTask = useCallback(() => {
    setCurrentTask(null);
    setIsExecuting(false);
    setError(null);
  }, []);

  return {
    currentTask,
    taskHistory,
    isExecuting,
    error,
    createTask,
    updateTaskStatus,
    clearError,
    resetTask,
    addToHistory
  };
};
