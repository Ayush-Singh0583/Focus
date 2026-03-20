import { useTheme } from '../../context/ThemeContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#7c6dfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#f472b6', '#a78bfa']

function useChartColors() {
  const { isDark } = useTheme()
  return {
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    axis: isDark ? '#6b6b80' : '#9ca3af',
    tooltip: { bg: isDark ? '#1e1e24' : '#fff', border: isDark ? '#2e2e38' : '#e5e7eb', color: isDark ? '#f0f0f5' : '#111' }
  }
}

function CustomTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: colors.tooltip.bg, border: `1px solid ${colors.tooltip.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: colors.tooltip.color }}>
      {label && <p style={{ marginBottom: 6, fontWeight: 600, color: colors.axis }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export function WeeklyBarChart({ data, loading }) {
  const colors = useChartColors()
  if (loading) return <div className="skeleton h-56 rounded-xl" />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: colors.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: 'rgba(124,109,250,0.06)' }} />
        <Bar dataKey="total" name="Total" fill="rgba(124,109,250,0.25)" radius={[4,4,0,0]} />
        <Bar dataKey="completed" name="Completed" fill="#7c6dfa" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendLineChart({ data, loading }) {
  const colors = useChartColors()
  if (loading) return <div className="skeleton h-56 rounded-xl" />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: colors.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: colors.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip colors={colors} />} />
        <Line type="monotone" dataKey="completed" name="Completed" stroke="#7c6dfa" strokeWidth={2.5}
          dot={false} activeDot={{ r: 5, fill: '#7c6dfa', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CompletionDonutChart({ data, loading }) {
  const colors = useChartColors()
  if (loading) return <div className="skeleton h-48 w-48 rounded-full mx-auto" />
  const chartData = [
    { name: 'Completed', value: data?.completed || 0 },
    { name: 'Remaining', value: Math.max(0, (data?.total || 0) - (data?.completed || 0)) }
  ]
  const rate = data?.total ? Math.round((data.completed / data.total) * 100) : 0
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={85}
            paddingAngle={chartData[1].value > 0 ? 4 : 0} dataKey="value" startAngle={90} endAngle={-270}>
            <Cell fill="#7c6dfa" />
            <Cell fill={colors.grid} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display text-3xl font-bold text-surface-900 dark:text-white">{rate}%</span>
        <span className="text-xs text-surface-500 dark:text-surface-400">Done</span>
      </div>
    </div>
  )
}

export function CategoryBarChart({ data, loading }) {
  const colors = useChartColors()
  if (loading) return <div className="skeleton h-48 rounded-xl" />
  if (!data?.length) return <div className="flex items-center justify-center h-48 text-sm text-surface-400">No data yet</div>
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: colors.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: colors.axis }} axisLine={false} tickLine={false} width={70} />
        <Tooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: 'rgba(124,109,250,0.06)' }} />
        <Bar dataKey="count" name="Total" fill="rgba(124,109,250,0.3)" radius={[0,4,4,0]} />
        <Bar dataKey="completed" name="Completed" fill="#7c6dfa" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
