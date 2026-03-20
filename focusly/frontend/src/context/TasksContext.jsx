import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { tasksApi } from '../services/api'
import toast from 'react-hot-toast'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('focusly_tasks_cache')) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastFetch = useRef(null)

  const cacheTasks = (data) => {
    setTasks(data)
    localStorage.setItem('focusly_tasks_cache', JSON.stringify(data))
  }

  const fetchTasks = useCallback(async (params = {}, force = false) => {
    const now = Date.now()
    if (!force && lastFetch.current && now - lastFetch.current < 10000 && !Object.keys(params).length) return
    setLoading(true); setError(null)
    try {
      const { data } = await tasksApi.getAll(params)
      cacheTasks(data.tasks)
      lastFetch.current = now
    } catch (err) {
      setError(err.message || 'Failed to load tasks')
    } finally { setLoading(false) }
  }, [])

  const createTask = useCallback(async (taskData) => {
    const { data } = await tasksApi.create(taskData)
    setTasks(prev => {
      const updated = [data.task, ...prev]
      localStorage.setItem('focusly_tasks_cache', JSON.stringify(updated))
      return updated
    })
    toast.success('Task created')
    return data.task
  }, [])

  const updateTask = useCallback(async (id, updates) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t))
    try {
      const { data } = await tasksApi.update(id, updates)
      setTasks(prev => {
        const updated = prev.map(t => t._id === id ? data.task : t)
        localStorage.setItem('focusly_tasks_cache', JSON.stringify(updated))
        return updated
      })
      return data.task
    } catch (err) {
      // Revert on failure
      await fetchTasks({}, true)
      throw err
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id))
    try {
      await tasksApi.delete(id)
      localStorage.setItem('focusly_tasks_cache', JSON.stringify(tasks.filter(t => t._id !== id)))
      toast.success('Task deleted')
    } catch (err) {
      await fetchTasks({}, true)
      throw err
    }
  }, [tasks, fetchTasks])

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const { data } = await tasksApi.toggleSubtask(taskId, subtaskId)
    setTasks(prev => {
      const updated = prev.map(t => t._id === taskId ? data.task : t)
      localStorage.setItem('focusly_tasks_cache', JSON.stringify(updated))
      return updated
    })
    return data.task
  }, [])

  const updateTaskLocal = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t))
  }, [])

  return (
    <TasksContext.Provider value={{
      tasks, loading, error,
      fetchTasks, createTask, updateTask, deleteTask, toggleSubtask, updateTaskLocal
    }}>
      {children}
    </TasksContext.Provider>
  )
}

export const useTasks = () => useContext(TasksContext)
