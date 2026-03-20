import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'
import { analyticsApi } from '../services/api'
import KPICard from '../components/ui/KPICard'
import TaskItem from '../components/tasks/TaskItem'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import { WeeklyBarChart, TrendLineChart, CompletionDonutChart, CategoryBarChart } from '../components/charts/Charts'
import { ChartSkeleton } from '../components/ui/Skeletons'

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, fetchTasks } = useTasks()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [catData, setCatData] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [detailTask, setDetailTask] = useState(null)
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    fetchTasks()
    loadStats()
    loadCharts()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const { data } = await analyticsApi.dashboard()
      setStats(data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const loadCharts = async () => {
    setChartsLoading(true)
    try {
      const [weekly, trend, cats] = await Promise.all([
        analyticsApi.weekly(),
        analyticsApi.trend(),
        analyticsApi.categories()
      ])
      setWeeklyData(weekly.data.data)
      setTrendData(trend.data.data)
      setCatData(cats.data.data)
    } catch (err) { console.error(err) }
    finally { setChartsLoading(false) }
  }

  // Today's tasks from local context
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks
    .filter(t => t.dueDate && t.dueDate.split('T')[0] === today)
    .slice(0, 5)

  const overdueTasks = tasks.filter(t =>
    t.status !== 'completed' && t.dueDate && t.dueDate.split('T')[0] < today
  ).slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const formatFocusTime = (mins) => {
    if (!mins) return '0m'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Task
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Today's Tasks" value={stats?.todayTotal ?? '—'} sub={`${stats?.todayCompleted ?? 0} completed`}
          icon="📋" color="bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400" loading={loading} />
        <KPICard label="Completion Rate" value={stats ? `${stats.todayRate}%` : '—'} sub="Today"
          icon="✅" color="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" loading={loading} />
        <KPICard label="Streak" value={stats ? `${stats.streak?.current ?? 0}🔥` : '—'} sub={`Longest: ${stats?.streak?.longest ?? 0} days`}
          icon="⚡" color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" loading={loading} />
        <KPICard label="Focus Time" value={formatFocusTime(stats?.totalFocusMinutes)} sub="All time"
          icon="⏱" color="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" loading={loading} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Today's Tasks</h2>
            <button onClick={() => navigate('/tasks?filter=today')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">
              View all →
            </button>
          </div>
          {todayTasks.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">No tasks for today</p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">Add your first task to start tracking</p>
              <button onClick={() => setFormOpen(true)} className="btn-primary text-xs">Add task</button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <TaskItem key={task._id} task={task} onEdit={setEditTask} onDetail={setDetailTask} />
              ))}
            </div>
          )}

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <h2 className="section-title text-red-500 dark:text-red-400">Overdue</h2>
                <span className="badge bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px]">{overdueTasks.length}</span>
              </div>
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <TaskItem key={task._id} task={task} onEdit={setEditTask} onDetail={setDetailTask} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Donut */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Today's Progress</h2>
            <CompletionDonutChart data={{ total: stats?.todayTotal || 0, completed: stats?.todayCompleted || 0 }} loading={loading} />
            <div className="flex justify-center gap-4 mt-3 text-xs text-surface-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" />Completed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-surface-200 dark:bg-surface-700 inline-block" />Remaining</span>
            </div>
          </div>

          {/* Streak card */}
          <div className="card p-5">
            <h2 className="section-title mb-3">Productivity</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.streak?.current ?? 0}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">Current streak</p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-surface-900 dark:text-white">{stats?.weekCompleted ?? 0}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">This week</p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-surface-900 dark:text-white">{stats?.completionRate ?? 0}%</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">All-time rate</p>
              </div>
              <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-red-500 dark:text-red-400">{stats?.overdueTasks ?? 0}</p>
                <p className="text-xs text-red-500/70 dark:text-red-400/70 mt-0.5">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="section-title mb-5">Last 7 Days</h2>
          {chartsLoading ? <ChartSkeleton height="h-64" /> : <WeeklyBarChart data={weeklyData} />}
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-5">30-Day Trend</h2>
          {chartsLoading ? <ChartSkeleton height="h-64" /> : <TrendLineChart data={trendData} />}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-5">By Category</h2>
        {chartsLoading ? <ChartSkeleton height="h-48" /> : <CategoryBarChart data={catData} />}
      </div>

      {/* Modals */}
      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} />
      <TaskForm open={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
      <TaskDetail open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} onEdit={(t) => { setDetailTask(null); setEditTask(t) }} />
    </div>
  )
}
