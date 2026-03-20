import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTasks } from '../context/TasksContext'
import TaskItem from '../components/tasks/TaskItem'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import { TaskItemSkeleton } from '../components/ui/Skeletons'
import clsx from 'clsx'

const DATE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
]

export default function TasksPage() {
  const { tasks, loading, fetchTasks, deleteTaskById } = useTasks()
  const [searchParams, setSearchParams] = useSearchParams()

  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [detailTask, setDetailTask] = useState(null)

  // 🔥 NEW STATE FOR DELETE
  const [deleteTask, setDeleteTask] = useState(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [dateFilter, setDateFilter] = useState(searchParams.get('filter') || 'all')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [sortBy, setSortBy] = useState('-createdAt')

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setFormOpen(true)
      setSearchParams({})
    }
  }, [searchParams])

  useEffect(() => { fetchTasks() }, [])

  const today = new Date().toLocaleDateString('en-CA')
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA')

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.category || '').toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    if (catFilter && t.category !== catFilter) return false
    const due = t.dueDate?.split('T')[0]
    if (dateFilter === 'today' && due !== today) return false
    if (dateFilter === 'upcoming' && (!due || due < tomorrow)) return false
    if (dateFilter === 'overdue' && (!due || due >= today || t.status === 'completed')) return false
    return true
  }).sort((a, b) => {
    if (sortBy === '-createdAt') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'dueDate') return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1
    if (sortBy === 'priority') { const o = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority] }
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    return 0
  })

  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))]

  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <span className="text-white text-lg">📝</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Tasks</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {tasks.length} total · {counts.pending} pending
            </p>
          </div>
        </div>

        <button className="btn-primary hover:scale-105 transition" onClick={() => setFormOpen(true)}>
          + New Task
        </button>
      </div>

      {/* CONTROLS */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-xl p-3 mb-5 shadow-sm">

        <div className="flex gap-3 flex-wrap">
          <input
            className="input flex-1 min-w-48"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select className="select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex gap-1 mt-3">
          {DATE_FILTERS.map(f => (
            <button key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={clsx(
                "px-3 py-1 rounded-lg text-sm",
                dateFilter === f.key
                  ? "bg-white dark:bg-slate-700 shadow"
                  : "text-slate-500"
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <TaskItemSkeleton key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={setEditTask}
              onDetail={setDetailTask}
              onDelete={(task) => setDeleteTask(task)} // 🔥 IMPORTANT
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} />
      <TaskForm open={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
      <TaskDetail open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} />

      {/* 🔥 DELETE MODAL */}
      {deleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTask(null)}
          />

          <div className="relative z-10 w-[90%] max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl">

            <h2 className="text-xl font-bold mb-2">Delete Task?</h2>

            <p className="mb-6 text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <b>{deleteTask.title}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTask(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await deleteTaskById(deleteTask._id)
                  setDeleteTask(null)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}