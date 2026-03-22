import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { tasksApi } from '../services/api'
import toast from 'react-hot-toast'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  // Initialize from localStorage with fallback
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = localStorage.getItem('focusly_tasks_cache')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastFetch = useRef(null)

  // Centralized cache update (memoized to prevent recreation)
  const cacheTasks = useCallback((data) => {
    setTasks(data)
    localStorage.setItem('focusly_tasks_cache', JSON.stringify(data))
  }, [])

  // Fetch with 10s cache + force refresh support
  const fetchTasks = useCallback(async (params = {}, force = false) => {
    const now = Date.now()

    // Skip if within cache window and no params/force
    if (!force && lastFetch.current && now - lastFetch.current < 10000 && !Object.keys(params).length) {
      return tasks
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await tasksApi.getAll(params)
      cacheTasks(data.tasks)
      lastFetch.current = now
      return data.tasks
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load tasks'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [cacheTasks, tasks])

  // Create task with optimistic feedback
  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await tasksApi.create(taskData)
      cacheTasks([data.task, ...tasks])
      toast.success('Task created successfully!')
      return data.task
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create task'
      toast.error(message)
      throw err
    }
  }, [tasks, cacheTasks])

  // Update with optimistic UI + rollback
  const updateTask = useCallback(async (id, updates) => {
    // Optimistic update
    const optimisticTasks = tasks.map(t => t._id === id ? { ...t, ...updates } : t)
    setTasks(optimisticTasks)

    try {
      const { data } = await tasksApi.update(id, updates)
      cacheTasks(tasks.map(t => t._id === id ? data.task : t))
      toast.success('Task updated successfully!')
      return data.task
    } catch (err) {
      // Rollback to server state
      await fetchTasks({}, true)
      const message = err.response?.data?.message || 'Failed to update task'
      toast.error(message)
      throw err
    }
  }, [tasks, cacheTasks, fetchTasks])

  // Delete with optimistic removal + rollback
  const deleteTask = useCallback(async (id) => {
    // Optimistic delete
    const optimisticTasks = tasks.filter(t => t._id !== id)
    setTasks(optimisticTasks)

    try {
      await tasksApi.delete(id)
      cacheTasks(optimisticTasks)
      toast.success('Task deleted successfully!')
    } catch (err) {
      // Rollback to server state
      await fetchTasks({}, true)
      const message = err.response?.data?.message || 'Failed to delete task'
      toast.error(message)
      throw err
    }
  }, [tasks, cacheTasks, fetchTasks])

  // Toggle subtask
  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    try {
      const { data } = await tasksApi.toggleSubtask(taskId, subtaskId)
      cacheTasks(tasks.map(t => t._id === taskId ? data.task : t))
      return data.task
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle subtask'
      toast.error(message)
      throw err
    }
  }, [tasks, cacheTasks])

  // Local-only updates (no API call)
  const updateTaskLocal = useCallback((id, updates) => {
    cacheTasks(tasks.map(t => t._id === id ? { ...t, ...updates } : t))
  }, [tasks, cacheTasks])

  // Auto-fetch on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    updateTaskLocal,
    refetch: () => fetchTasks({}, true)
  }), [
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    updateTaskLocal
  ])

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  )
}

// Custom hook with error boundary
export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}
