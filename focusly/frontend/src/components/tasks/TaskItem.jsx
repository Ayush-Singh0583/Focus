import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useTasks } from '../../context/TasksContext'
import { useTimer } from '../../hooks/useTimer'
import { PriorityBadge, CategoryBadge, DueDateBadge } from '../ui/Badges'
import toast from 'react-hot-toast'

export default function TaskItem({ task, onEdit, onDetail, onDelete, compact }) {
  const { updateTask, deleteTask } = useTasks()
  const { running, formatElapsed, start, stop, loading: timerLoading } = useTimer(task)

  const [completing, setCompleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const menuRef = useRef(null)

  const isCompleted = task.status === 'completed'

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleComplete = async () => {
    setCompleting(true)
    try {
      await updateTask(task._id, {
        status: isCompleted ? 'pending' : 'completed',
        progress: isCompleted ? task.progress : 100
      })
    } catch {
      toast.error('Failed to update task')
    } finally {
      setCompleting(false)
    }
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    setMenuOpen(false)
    try {
      await deleteTask(task._id)
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleting(false)
    }
  }

  const subtaskDone = task.subtasks?.filter(s => s.done).length || 0
  const subtaskTotal = task.subtasks?.length || 0

  return (
    <div
      className={clsx(
        'card-hover p-4 flex items-center gap-4 group cursor-pointer relative overflow-visible',
        isCompleted && 'opacity-60',
        'animate-fade-in hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 rounded-2xl'
      )}
      onClick={() => onDetail?.(task)}
    >

      {/* Shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); toggleComplete() }}
        disabled={completing}
        className={clsx(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition',
          isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
        )}
      >
        {isCompleted && '✓'}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm font-semibold truncate',
          isCompleted && 'line-through text-slate-400'
        )}>
          {task.title}
        </p>

        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            <DueDateBadge dueDate={task.dueDate} status={task.status} />
          </div>
        )}
      </div>

      {/* Timer */}
      {!compact && task.status !== 'completed' && (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {running && (
            <span className="text-xs font-mono text-blue-500">
              {formatElapsed()}
            </span>
          )}

          <button
            onClick={running ? stop : start}
            disabled={timerLoading}
            className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700"
          >
            {running ? '⏸' : '▶'}
          </button>
        </div>
      )}

      {/* 🔥 MENU */}
      <div
        ref={menuRef}
        className="relative opacity-0 group-hover:opacity-100 transition ml-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          ⋮⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[999]">

            <button
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => { setMenuOpen(false); onEdit?.(task) }}
            >
              ✏️ Edit
            </button>

            <button
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => { setMenuOpen(false); onDetail?.(task) }}
            >
              📄 Details
            </button>

            <button
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "🗑 Delete"}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}