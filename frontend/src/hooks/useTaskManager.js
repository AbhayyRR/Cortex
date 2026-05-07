import { useState, useCallback } from 'react';

export const useTaskManager = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  const createTask = useCallback((query) => {
    const task = {
      taskId: Date.now().toString(),
      query,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setCurrentTask(task);
    setTaskHistory(prev => [task, ...prev]);
    setIsExecuting(true);
    setError(null);
    return task;
  }, []);

  const updateTaskStatus = useCallback((result) => {
    setCurrentTask(prev => prev ? { ...prev, ...result } : null);
    setTaskHistory(prev => 
      prev.map(task => 
        task.taskId === result.taskId 
          ? { ...task, ...result }
          : task
      )
    );
    
    if (result.status === 'completed' || result.status === 'failed') {
      setIsExecuting(false);
    }
  }, []);

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
  };
};
