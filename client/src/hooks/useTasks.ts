import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput } from '@shared/schema';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<Task | null>;
  refreshTasks: () => Promise<void>;
  getTask: (id: string) => Task | undefined;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task | null> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create task');
      }
      
      const data = await response.json();
      // Add to local state
      setTasks(prev => [data.task, ...prev]);
      return data.task;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  const getTask = useCallback((id: string): Task | undefined => {
    return tasks.find(t => t.id === id);
  }, [tasks]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/agents`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'task_created':
            setTasks(prev => {
              // Avoid duplicates
              if (prev.some(t => t.id === message.data.id)) return prev;
              return [message.data, ...prev];
            });
            break;
            
          case 'task_status_changed':
          case 'subtask_updated':
          case 'subtask_assigned':
            const updatedTask = message.data.task || message.data;
            setTasks(prev => 
              prev.map(t => t.id === updatedTask.id ? updatedTask : t)
            );
            break;
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('Task WebSocket error:', err);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    refreshTasks: fetchTasks,
    getTask,
  };
}

export default useTasks;
