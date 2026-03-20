import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import KPICard from '../components/ui/KPICard'
import { WeeklyBarChart, TrendLineChart, CompletionDonutChart, CategoryBarChart } from '../components/charts/Charts'
import { ChartSkeleton } from '../components/ui/Skeletons'

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [catData, setCatData] = useState([])
  const [heatmap, setHeatmap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dash, weekly, trend, cats, hm] = await Promise.all([
          analyticsApi.dashboard(),
          analyticsApi.weekly(),
          analyticsApi.trend(),
          analyticsApi.categories(),
          analyticsApi.heatmap()
        ])
        setStats(dash.data.data)
        setWeeklyData(weekly.data.data)
        setTrendData(trend.data.data)
        setCatData(cats.data.data)
        setHeatmap(hm.data.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const formatFocus = (m) => !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`

  // Build heatmap cells for last 52 weeks
  const heatmapCells = []
  for (let w = 51; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const date = new Date(Date.now() - (w * 7 + d) * 86400000)
      const key = date.toISOString().split('T')[0]
      const count = heatmap[key] || 0
      heatmapCells.push({ key, count, date })
    }
  }
  const maxCount = Math.max(...heatmapCells.map(c => c.count), 1)

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Your productivity insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Tasks" value={stats?.totalTasks ?? '—'} loading={loading} icon="📋" />
        <KPICard label="Completion Rate" value={stats ? `${stats.completionRate}%` : '—'} loading={loading} icon="📈" />
        <KPICard label="Current Streak" value={stats ? `${stats.streak?.current ?? 0}🔥` : '—'} loading={loading} icon="⚡" />
        <KPICard label="Total Focus" value={stats ? formatFocus(stats.totalFocusMinutes) : '—'} loading={loading} icon="⏱" />
      </div>

      {/* Donut + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h2 className="section-title mb-4">Overall Completion</h2>
          <CompletionDonutChart
            data={{ total: stats?.totalTasks || 0, completed: stats ? Math.round((stats.completionRate / 100) * stats.totalTasks) : 0 }}
            loading={loading} />
          <div className="flex justify-center gap-5 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-surface-200 dark:bg-surface-700 inline-block" />Remaining</span>
          </div>
        </div>
        <div className="lg:col-span-2 card p-5">
          <h2 className="section-title mb-4">Category Breakdown</h2>
          {loading ? <ChartSkeleton height="h-64" /> : <CategoryBarChart data={catData} />}
        </div>
      </div>

      {/* Weekly + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="section-title mb-4">Last 7 Days</h2>
          {loading ? <ChartSkeleton height="h-56" /> : <WeeklyBarChart data={weeklyData} />}
          <div className="flex gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500/30 inline-block" />Total</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />Completed</span>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-4">30-Day Completion Trend</h2>
          {loading ? <ChartSkeleton height="h-56" /> : <TrendLineChart data={trendData} />}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Activity Heatmap — Last 52 Weeks</h2>
        <div className="overflow-x-auto">
          <div className="grid gap-[3px] min-w-max" style={{ gridTemplateColumns: `repeat(52, 1fr)`, gridTemplateRows: 'repeat(7, 1fr)' }}>
            {heatmapCells.map((cell, i) => {
              const intensity = cell.count === 0 ? 0 : Math.ceil((cell.count / maxCount) * 4)
              const colors = ['bg-surface-200 dark:bg-surface-700', 'bg-brand-200 dark:bg-brand-900', 'bg-brand-300 dark:bg-brand-700', 'bg-brand-400 dark:bg-brand-500', 'bg-brand-500']
              return (
                <div key={i}
                  title={`${cell.key}: ${cell.count} completed`}
                  className={`w-3 h-3 rounded-[2px] transition-colors ${colors[intensity]} cursor-pointer hover:ring-1 hover:ring-brand-400`}
                />
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-surface-400">
          <span>Less</span>
          {['bg-surface-200 dark:bg-surface-700','bg-brand-200 dark:bg-brand-900','bg-brand-300 dark:bg-brand-700','bg-brand-400 dark:bg-brand-500','bg-brand-500'].map((c,i) => (
            <span key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
