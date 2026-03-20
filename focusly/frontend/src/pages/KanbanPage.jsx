import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import { PriorityBadge, DueDateBadge } from '../components/ui/Badges'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'pending', label: 'Pending', dotColor: 'bg-surface-400', headerColor: 'text-surface-600 dark:text-surface-400' },
  { key: 'inprogress', label: 'In Progress', dotColor: 'bg-blue-500', headerColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'completed', label: 'Completed', dotColor: 'bg-green-500', headerColor: 'text-green-600 dark:text-green-400' },
]

function KanbanCard({ task, onEdit, onDetail, onMove }) {
  const subtaskDone = task.subtasks?.filter(s => s.done).length || 0
  const subtaskTotal = task.subtasks?.length || 0
  return (
    <div className="card-hover p-3.5 cursor-pointer animate-slide-up" onClick={() => onDetail(task)}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-sm font-medium text-surface-900 dark:text-white leading-snug flex-1">{task.title}</p>
        <button onClick={e => { e.stopPropagation(); onEdit(task) }}
          className="text-surface-400 hover:text-surface-700 dark:hover:text-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 text-xs">✏</button>
      </div>
      {task.description && (
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-2.5 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-2.5">
        <PriorityBadge priority={task.priority} />
        <DueDateBadge dueDate={task.dueDate} status={task.status} />
      </div>
      {task.progress > 0 && (
        <div className="mb-2.5">
          <div className="h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
      {subtaskTotal > 0 && (
        <p className="text-[10px] text-surface-400 dark:text-surface-500">{subtaskDone}/{subtaskTotal} subtasks</p>
      )}
      {/* Quick move */}
      <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-surface-100 dark:border-surface-700" onClick={e => e.stopPropagation()}>
        {COLUMNS.filter(c => c.key !== task.status).map(c => (
          <button key={c.key} onClick={() => onMove(task._id, c.key)}
            className="text-[10px] px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
            → {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { tasks, updateTask } = useTasks()
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [detailTask, setDetailTask] = useState(null)

  const handleMove = async (taskId, newStatus) => {
    try { await updateTask(taskId, { status: newStatus }) }
    catch { toast.error('Failed to move task') }
  }

  return (
    <div className="p-6 h-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{tasks.length} tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[calc(100vh-180px)]">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="flex flex-col bg-surface-100 dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
              {/* Column header */}
              <div className="px-4 py-3.5 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2.5 flex-shrink-0">
                <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', col.dotColor)} />
                <span className={clsx('text-sm font-semibold', col.headerColor)}>{col.label}</span>
                <span className="ml-auto text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-xs text-surface-400 dark:text-surface-500">No {col.label.toLowerCase()} tasks</p>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div key={task._id} className="group">
                      <KanbanCard task={task} onEdit={setEditTask} onDetail={setDetailTask} onMove={handleMove} />
                    </div>
                  ))
                )}
                <button onClick={() => setFormOpen(true)}
                  className="w-full py-2.5 text-xs text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-white border border-dashed border-surface-300 dark:border-surface-700 rounded-xl transition-all hover:border-surface-400 dark:hover:border-surface-600">
                  + Add task
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} />
      <TaskForm open={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
      <TaskDetail open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} onEdit={(t) => { setDetailTask(null); setEditTask(t) }} />
    </div>
  )
}
