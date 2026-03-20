import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import clsx from 'clsx'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// 🎯 ALL EVENTS
const EVENTS = [
  // 🔴 Holidays
  { date: "2026-02-07", type: "holiday" },
  { date: "2026-02-21", type: "holiday" },
  { date: "2026-03-04", type: "holiday" },
  { date: "2026-03-19", type: "holiday" },
  { date: "2026-03-21", type: "holiday" },
  { date: "2026-03-31", type: "holiday" },
  { date: "2026-04-03", type: "holiday" },
  { date: "2026-04-04", type: "holiday" },
  { date: "2026-04-14", type: "holiday" },
  { date: "2026-04-18", type: "holiday" },
  { date: "2026-04-20", type: "holiday" },
  { date: "2026-05-01", type: "holiday" },
  { date: "2026-05-02", type: "holiday" },

  // 🟡 Internal Exams (CIE)
  { date: "2026-03-09", type: "cie" },
  { date: "2026-03-10", type: "cie" },
  { date: "2026-03-11", type: "cie" },
  { date: "2026-04-22", type: "cie" },
  { date: "2026-04-23", type: "cie" },
  { date: "2026-04-24", type: "cie" },

  // 🟢 External Exams (SEE)
  { date: "2026-05-18", type: "see" },
  { date: "2026-05-19", type: "see" },
  { date: "2026-05-20", type: "see" },
  { date: "2026-05-21", type: "see" },
  { date: "2026-05-22", type: "see" },
  { date: "2026-05-23", type: "see" },
  { date: "2026-05-25", type: "see" },
  { date: "2026-05-26", type: "see" },
  { date: "2026-05-27", type: "see" },
  { date: "2026-05-28", type: "see" },
  { date: "2026-05-29", type: "see" },
  
  // 🔴 All Sundays (auto-generated)
  ...Array.from({ length: 365 }, (_, i) => {
    const date = new Date(2026, 0, 1 + i)
    if (date.getDay() === 0) { // Sunday only (fixed)
      return {
        date: date.toISOString().split('T')[0],
        type: "holiday"
      }
    }
    return null
  }).filter(Boolean),

  ...Array.from({ length: 27 }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, '0')}`,
    type: "see"
  }))
]

export default function CalendarPage() {
  const { tasks } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [formOpen, setFormOpen] = useState(false)
  const [detailTask, setDetailTask] = useState(null)
  const [editTask, setEditTask] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date().toISOString().split('T')[0]

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, date: null })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ day: d, currentMonth: true, date: dateStr })
  }

  // Next month days
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: null })
  }

  const getTasksForDate = (dateStr) =>
    tasks.filter(t => t.dueDate?.split('T')[0] === dateStr)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
          {MONTHS[month]} {year}
        </h1>

        <div className="flex items-center gap-3">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-slate-700 dark:text-slate-300 hover:scale-105"
            aria-label="Previous month"
          >
            ◀
          </button>
          <button 
            onClick={goToday}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
            aria-label="Go to today"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-slate-700 dark:text-slate-300 hover:scale-105"
            aria-label="Next month"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span className="text-slate-700 dark:text-slate-300">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
          <span className="text-slate-700 dark:text-slate-300">CIE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span className="text-slate-700 dark:text-slate-300">SEE</span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden rounded-2xl">
        
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-700">
          {DAYS.map(d => (
            <div key={d} className="text-center text-sm font-bold py-4 text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayTasks = cell.date ? getTasksForDate(cell.date) : []
            const isToday = cell.date === today
            const event = EVENTS.find(e => e.date === cell.date)
            const taskCount = dayTasks.length

            return (
              <div
                key={idx}
                className={clsx(
                  'group relative min-h-[120px] p-3 border-r border-b last:border-r-0 last-of-type:border-b-0 transition-all duration-200 hover:scale-[1.02] cursor-pointer',
                  
                  // Base cell
                  'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm',

                  // Previous/Next month
                  !cell.currentMonth && 'opacity-50',

                  // Event colors (Dark mode friendly)
                  event?.type === 'holiday' && 'bg-gradient-to-br from-red-400/20 to-red-500/30 dark:from-red-500/20 dark:to-red-600/30 border-red-200/50 dark:border-red-500/40',
                  event?.type === 'cie' && 'bg-gradient-to-br from-yellow-400/20 to-yellow-500/30 dark:from-yellow-500/20 dark:to-amber-600/30 border-yellow-200/50 dark:border-yellow-500/40',
                  event?.type === 'see' && 'bg-gradient-to-br from-green-400/20 to-green-500/30 dark:from-green-500/20 dark:to-emerald-600/30 border-green-200/50 dark:border-green-500/40',

                  // Today highlight
                  isToday && 'ring-4 ring-blue-400/50 shadow-lg scale-105',

                  // Hover effects
                  'hover:shadow-md hover:bg-opacity-90 group-hover:scale-[1.01]',

                  // Task count styling
                  taskCount > 0 && 'ring-1 ring-blue-200/50 dark:ring-blue-500/40'
                )}
                role="button"
                tabIndex={0}
                aria-label={`${cell.day} ${cell.currentMonth ? MONTHS[month] : ''}, ${taskCount} tasks${event ? `, ${event.type.toUpperCase()}` : ''}`}
              >
                {/* Day Number */}
                <div className="text-lg font-bold mb-1.5 text-slate-800 dark:text-slate-100">
                  {cell.day}
                </div>

                {/* Event Badge */}
                {event && (
                  <div className={clsx(
                    'text-xs font-bold px-2 py-1 rounded-full mb-2 uppercase tracking-wide shadow-sm',
                    event.type === 'holiday' && 'bg-red-500 text-white',
                    event.type === 'cie' && 'bg-yellow-500 text-slate-900',
                    event.type === 'see' && 'bg-green-600 text-white'
                  )}>
                    {event.type.toUpperCase()}
                  </div>
                )}

                {/* Task Count Badge */}
                {taskCount > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {taskCount}
                    </span>
                  </div>
                )}

                {/* Task List (truncated) */}
                {dayTasks.slice(0, 2).map(task => (
                  <div 
                    key={task._id} 
                    className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 px-2 py-1 rounded mb-1 truncate shadow-sm border border-blue-200/50 dark:border-blue-500/30"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}

                {/* More tasks indicator */}
                {taskCount > 2 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                    +{taskCount - 2} more
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} />
      <TaskDetail open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} />
    </div>
  )
}
