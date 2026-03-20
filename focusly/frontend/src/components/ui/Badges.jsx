import clsx from 'clsx'

const priorityConfig = {
  high: { label: 'High', classes: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  medium: { label: 'Medium', classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  low: { label: 'Low', classes: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
}

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300' },
  inprogress: { label: 'In Progress', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  completed: { label: 'Completed', classes: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
}

export function PriorityBadge({ priority, className }) {
  const config = priorityConfig[priority] || priorityConfig.medium
  return <span className={clsx('badge text-[11px]', config.classes, className)}>{config.label}</span>
}

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || statusConfig.pending
  return <span className={clsx('badge text-[11px]', config.classes, className)}>{config.label}</span>
}

export function CategoryBadge({ category, className }) {
  return (
    <span className={clsx('badge text-[11px] bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400', className)}>
      {category || 'General'}
    </span>
  )
}

export function DueDateBadge({ dueDate, status }) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  const today = new Date(now); today.setHours(0,0,0,0)
  const isOverdue = due < today && status !== 'completed'
  const isToday = due.toDateString() === now.toDateString()
  return (
    <span className={clsx('badge text-[11px]',
      isOverdue ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
      isToday ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
      'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
    )}>
      {isOverdue ? '⚠ ' : ''}{due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  )
}
