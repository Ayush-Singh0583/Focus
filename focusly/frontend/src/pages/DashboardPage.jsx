import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TasksContext'

import KPICard from '../components/ui/KPICard'
import TaskItem from '../components/tasks/TaskItem'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'

import {
  WeeklyBarChart,
  TrendLineChart,
  CompletionDonutChart,
  CategoryBarChart
} from '../components/charts/Charts'


export default function DashboardPage() {

  const { user } = useAuth()
  const { tasks, fetchTasks } = useTasks()
  const navigate = useNavigate()

  const [formOpen, setFormOpen] = useState(false)
  const [detailTask, setDetailTask] = useState(null)
  const [editTask, setEditTask] = useState(null)


  // load tasks once
  useEffect(() => {

    if (user) fetchTasks()

  }, [user])


  // ---------- DATE HELPERS ----------

  const today = new Date().toLocaleDateString('en-CA')


  // ---------- COMPUTED STATS ----------

  const stats = useMemo(() => {

    const todayTasks = tasks.filter(t => {

      if (!t.dueDate) return false

      return new Date(t.dueDate)
        .toLocaleDateString('en-CA') === today

    })

    const completedToday =
      todayTasks.filter(t => t.status === 'completed').length


    const completionRate =
      todayTasks.length === 0
        ? 0
        : Math.round((completedToday / todayTasks.length) * 100)


    const overdueTasks =
      tasks.filter(t =>
        t.status !== 'completed' &&
        t.dueDate &&
        new Date(t.dueDate)
          .toLocaleDateString('en-CA') < today
      ).length


    const totalFocusMinutes =
      tasks.reduce(
        (sum, t) => sum + (t.totalFocusMinutes || 0),
        0
      )


    return {

      todayTotal: todayTasks.length,

      todayCompleted: completedToday,

      todayRate: completionRate,

      overdueTasks,

      totalFocusMinutes,

      weekCompleted:
        tasks.filter(t => t.status === 'completed').length,

      completionRate:
        tasks.length === 0
          ? 0
          : Math.round(
              (
                tasks.filter(t => t.status === 'completed').length
                / tasks.length
              ) * 100
            )

    }

  }, [tasks])


  // ---------- CHART DATA ----------

  const weeklyData = useMemo(() => {

    const days = 7

    const result = []

    for (let i = days - 1; i >= 0; i--) {

      const d = new Date()

      d.setDate(d.getDate() - i)

      const date = d.toLocaleDateString('en-CA')

      const dayTasks =
        tasks.filter(t =>
          t.dueDate &&
          new Date(t.dueDate)
            .toLocaleDateString('en-CA') === date
        )

      result.push({

        date,

        completed:
          dayTasks.filter(
            t => t.status === 'completed'
          ).length

      })

    }

    return result

  }, [tasks])


  const categoryData = useMemo(() => {

    const map = {}

    tasks.forEach(t => {

      map[t.category || 'General'] =
        (map[t.category || 'General'] || 0) + 1

    })

    return Object.keys(map).map(k => ({
      name: k,
      value: map[k]
    }))

  }, [tasks])


  const trendData = weeklyData


  // ---------- FILTER TASKS ----------

  const todayTasks =
    tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate)
        .toLocaleDateString('en-CA') === today
    ).slice(0, 5)


  const overdueList =
    tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate)
        .toLocaleDateString('en-CA') < today
    ).slice(0, 3)


  // ---------- UI HELPERS ----------

  const hour = new Date().getHours()

  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'


  const formatFocusTime = mins => {

    if (!mins) return '0m'

    if (mins < 60) return `${mins}m`

    return `${Math.floor(mins/60)}h ${mins%60}m`

  }


  return (

    <div className="p-6 space-y-6 max-w-7xl mx-auto">


      {/* header */}

      <div className="flex justify-between">

        <div>

          <h1 className="text-2xl font-bold">

            {greeting}, {user?.name}

          </h1>

        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="btn-primary px-4 py-2"
        >
          New Task
        </button>

      </div>


      {/* KPI */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <KPICard
          label="Today's Tasks"
          value={stats.todayTotal}
          sub={`${stats.todayCompleted} completed`}
        />

        <KPICard
          label="Completion Rate"
          value={`${stats.todayRate}%`}
          sub="Today"
        />

        <KPICard
          label="All-time Rate"
          value={`${stats.completionRate}%`}
        />

        <KPICard
          label="Focus Time"
          value={formatFocusTime(stats.totalFocusMinutes)}
        />

      </div>


      {/* tasks */}

      <h2 className="text-lg font-bold">

        Today

      </h2>


      {

        todayTasks.map(task => (

          <TaskItem

            key={task._id}

            task={task}

            onEdit={setEditTask}

            onDetail={setDetailTask}

          />

        ))

      }


      {

        overdueList.length > 0 && (

          <>

            <h2 className="text-red-500">

              Overdue

            </h2>

            {

              overdueList.map(task => (

                <TaskItem

                  key={task._id}

                  task={task}

                  onEdit={setEditTask}

                  onDetail={setDetailTask}

                />

              ))

            }

          </>

        )

      }


      {/* charts */}

      <WeeklyBarChart data={weeklyData} />

      <TrendLineChart data={trendData} />

      <CategoryBarChart data={categoryData} />

      <CompletionDonutChart
        data={{
          total: stats.todayTotal,
          completed: stats.todayCompleted
        }}
      />


      {/* modals */}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <TaskForm
        open={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
      />

      <TaskDetail
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={setEditTask}
      />

    </div>

  )

}