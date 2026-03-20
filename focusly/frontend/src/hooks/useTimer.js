import { useState, useEffect, useRef, useCallback } from 'react'
import { timersApi } from '../services/api'
import { useTasks } from '../context/TasksContext'
import toast from 'react-hot-toast'

// Global timer state (shared across renders)
const activeTimers = new Map()

export function useTimer(task) {
  const { updateTaskLocal } = useTasks()
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  const isRunning = task?.activeTimerStart != null || activeTimers.has(task?._id)

  useEffect(() => {
    if (!task) return
    const startTime = task.activeTimerStart ? new Date(task.activeTimerStart).getTime() : activeTimers.get(task._id)
    if (startTime) {
      setRunning(true)
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else {
      setRunning(false)
      setElapsed(0)
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [task?._id, task?.activeTimerStart])

  const start = useCallback(async () => {
    if (!task) return
    setLoading(true)
    try {
      const { data } = await timersApi.start(task._id)
      const startTime = new Date(data.startedAt).getTime()
      activeTimers.set(task._id, startTime)
      updateTaskLocal(task._id, { activeTimerStart: data.startedAt, status: data.task.status })
      setRunning(true)
      setElapsed(0)
      toast.success('Timer started')
    } catch (err) {
      toast.error(err.message || 'Failed to start timer')
    } finally { setLoading(false) }
  }, [task, updateTaskLocal])

  const stop = useCallback(async () => {
    if (!task) return
    setLoading(true)
    try {
      const { data } = await timersApi.stop(task._id)
      activeTimers.delete(task._id)
      updateTaskLocal(task._id, { activeTimerStart: null, actualMinutes: data.task.actualMinutes })
      setRunning(false)
      clearInterval(intervalRef.current)
      toast.success(`Logged ${data.loggedMinutes}m of focus time`)
    } catch (err) {
      toast.error(err.message || 'Failed to stop timer')
    } finally { setLoading(false) }
  }, [task, updateTaskLocal])

  const formatElapsed = () => {
    const h = Math.floor(elapsed / 3600)
    const m = Math.floor((elapsed % 3600) / 60)
    const s = elapsed % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  return { running, elapsed, loading, start, stop, formatElapsed }
}
