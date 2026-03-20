import { useTasks } from '../../context/TasksContext'
import { useTimer } from '../../hooks/useTimer'
import Modal from '../ui/Modal'
import { PriorityBadge, StatusBadge, CategoryBadge, DueDateBadge } from '../ui/Badges'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function TaskDetail({ open, onClose, task, onEdit }) {
  const { updateTask, toggleSubtask } = useTasks()
  const { running, formatElapsed, start, stop } = useTimer(task)

  if (!task) return null

  const handleToggleSubtask = async (subtaskId) => {
    try { await toggleSubtask(task._id, subtaskId) }
    catch { toast.error('Failed to update subtask') }
  }

  const formatMinutes = (min) => {
    if (!min) return '—'
    if (min < 60) return `${min}m`
    return `${Math.floor(min/60)}h ${min%60}m`
  }

  const subtaskDone = task.subtasks?.filter(s => s.done).length || 0
  const subtaskTotal = task.subtasks?.length || 0

  return (
    <Modal open={open} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h3 className="font-display text-lg font-semibold text-surface-900 dark:text-white mb-3">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            <CategoryBadge category={task.category} />
            <DueDateBadge dueDate={task.dueDate} status={task.status} />
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{task.description}</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Estimated', value: formatMinutes(task.estimatedMinutes) },
            { label: 'Actual', value: formatMinutes(task.actualMinutes) },
            { label: 'Progress', value: `${task.progress}%` },
            { label: 'Subtasks', value: subtaskTotal > 0 ? `${subtaskDone}/${subtaskTotal}` : '—' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
              <p className="text-[10px] text-surface-400 dark:text-surface-500 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-lg font-display font-semibold text-surface-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {task.progress > 0 && (
          <div>
            <div className="flex justify-between text-xs text-surface-500 mb-1.5">
              <span>Progress</span><span>{task.progress}%</span>
            </div>
            <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
                style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        )}

        {/* Timer */}
        {task.status !== 'completed' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-900 dark:text-white mb-0.5">Focus Timer</p>
              {running ? (
                <p className="text-2xl font-mono font-semibold text-brand-500">{formatElapsed()}</p>
              ) : (
                <p className="text-xs text-surface-500">Track focused work time</p>
              )}
            </div>
            <button
              onClick={running ? stop : start}
              className={clsx('btn', running ? 'btn-danger' : 'btn-primary')}
            >
              {running ? '⏹ Stop' : '▶ Start'}
            </button>
          </div>
        )}

        {/* Subtasks */}
        {subtaskTotal > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                Subtasks ({subtaskDone}/{subtaskTotal})
              </p>
            </div>
            <div className="h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: subtaskTotal ? `${(subtaskDone/subtaskTotal)*100}%` : '0%' }} />
            </div>
            <div className="space-y-2">
              {task.subtasks.map(sub => (
                <div key={sub._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  onClick={() => handleToggleSubtask(sub._id)}>
                  <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    sub.done ? 'bg-green-500 border-green-500' : 'border-surface-300 dark:border-surface-600')}>
                    {sub.done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={clsx('text-sm', sub.done ? 'line-through text-surface-400 dark:text-surface-500' : 'text-surface-700 dark:text-surface-300')}>{sub.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
          <button onClick={() => { onClose(); onEdit(task) }} className="btn-secondary flex-1">Edit Task</button>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </Modal>
  )
}
