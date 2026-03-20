import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />
}

export function KPICardSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function TaskItemSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

export function ChartSkeleton({ height = 'h-48' }) {
  return (
    <div className={clsx('card p-5', height)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex items-end gap-2 h-full pb-8">
        {[60,80,45,90,55,70,85].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}
