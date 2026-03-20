import clsx from 'clsx'

export default function KPICard({ label, value, sub, icon, color, loading }) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-20 mb-3 rounded" />
        <div className="skeleton h-8 w-16 mb-2 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    )
  }
  return (
    <div className="card p-5 hover:shadow-card-dark dark:hover:shadow-none transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-widest">{label}</p>
        {icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0', color || 'bg-brand-50 dark:bg-brand-500/10')}>
            {icon}
          </div>
        )}
      </div>
      <p className={clsx('font-display text-3xl font-bold mb-1.5', color ? '' : 'text-surface-900 dark:text-white')}>{value}</p>
      {sub && <p className="text-xs text-surface-500 dark:text-surface-400">{sub}</p>}
    </div>
  )
}
