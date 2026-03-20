import { useState, useEffect } from 'react'
import { useTasks } from '../../context/TasksContext'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const defaultForm = {
  title: '', description: '', priority: 'medium', status: 'pending',
  category: '', dueDate: '', estimatedMinutes: '', progress: 0,
  subtasks: [], tags: [], isRecurring: false, recurringPattern: 'none'
}

export default function TaskForm({ open, onClose, task }) {
  const { createTask, updateTask } = useTasks()
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')

  const isEdit = !!task

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        category: task.category || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedMinutes: task.estimatedMinutes || '',
        progress: task.progress || 0,
        subtasks: task.subtasks || [],
        tags: task.tags || [],
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || 'none'
      })
    } else {
      setForm({ ...defaultForm, dueDate: new Date().toISOString().split('T')[0] })
    }
  }, [task, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    set('subtasks', [...form.subtasks, { text: newSubtask.trim(), done: false }])
    setNewSubtask('')
  }
  const removeSubtask = (i) => set('subtasks', form.subtasks.filter((_, idx) => idx !== i))
  const toggleSubtaskDone = (i) => set('subtasks', form.subtasks.map((s, idx) => idx === i ? { ...s, done: !s.done } : s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        estimatedMinutes: parseInt(form.estimatedMinutes) || 0,
        progress: parseInt(form.progress) || 0,
        dueDate: form.dueDate || undefined,
        category: form.category || 'General',
      }
      if (isEdit) { await updateTask(task._id, payload); toast.success('Task updated') }
      else await createTask(payload)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save task')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="What needs to be done?" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Add more details…" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <input className="input" placeholder="Work, Personal…" value={form.category} onChange={e => set('category', e.target.value)} />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Estimated Time (min)</label>
            <input className="input" type="number" placeholder="60" min="0" value={form.estimatedMinutes} onChange={e => set('estimatedMinutes', e.target.value)} />
          </div>
          <div>
            <label className="label">Progress: {form.progress}%</label>
            <input type="range" min="0" max="100" value={form.progress}
              onChange={e => set('progress', parseInt(e.target.value))}
              className="w-full mt-2 accent-brand-500" />
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="label">Subtasks</label>
          {form.subtasks.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {form.subtasks.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <input type="checkbox" checked={s.done} onChange={() => toggleSubtaskDone(i)} className="accent-brand-500 flex-shrink-0" />
                  <span className={`flex-1 text-sm text-surface-700 dark:text-surface-300 ${s.done ? 'line-through opacity-60' : ''}`}>{s.text}</span>
                  <button type="button" onClick={() => removeSubtask(i)} className="text-surface-400 hover:text-red-500 transition-colors text-xs px-1">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Add subtask…" value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() }}} />
            <button type="button" onClick={addSubtask} className="btn-secondary px-3">Add</button>
          </div>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
          <input type="checkbox" id="recurring" checked={form.isRecurring}
            onChange={e => set('isRecurring', e.target.checked)} className="accent-brand-500" />
          <label htmlFor="recurring" className="text-sm text-surface-700 dark:text-surface-300 cursor-pointer flex-1">Recurring task</label>
          {form.isRecurring && (
            <select className="select w-auto text-xs py-1.5" value={form.recurringPattern} onChange={e => set('recurringPattern', e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </Modal>
  )
}
