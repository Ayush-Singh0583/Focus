import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTasks } from '../../context/TasksContext'
import clsx from 'clsx'

/* ---------------- ICON SYSTEM ---------------- */

function Icon({ size = 20, children, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

const GridIcon = ({ size }) => (
  <Icon size={size}>
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </Icon>
)

const CheckIcon = ({ size }) => (
  <Icon size={size}>
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </Icon>
)

const KanbanIcon = ({ size }) => (
  <Icon size={size}>
    <rect x="3" y="3" width="5" height="18"/>
    <rect x="10" y="3" width="5" height="12"/>
    <rect x="17" y="3" width="5" height="15"/>
  </Icon>
)

const CalIcon = ({ size }) => (
  <Icon size={size}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </Icon>
)

const TimeIcon = ({ size }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </Icon>
)

const ChartIcon = ({ size }) => (
  <Icon size={size}>
    <polyline points="18 20 18 10"/>
    <polyline points="12 20 12 4"/>
    <polyline points="6 20 6 14"/>
  </Icon>
)

const SettingsIcon = ({ size }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </Icon>
)

const LogoutIcon = ({ size }) => (
  <Icon size={size}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </Icon>
)

const MenuIcon = ({ size }) => (
  <Icon size={size}>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </Icon>
)

const SearchIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </Icon>
)

const SunIcon = ({ size }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="5"/>
  </Icon>
)

const MoonIcon = ({ size }) => (
  <Icon size={size}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </Icon>
)

const PlusIcon = ({ size }) => (
  <Icon size={size}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </Icon>
)

/* ---------------- NAV ---------------- */

const navItems = [
  { to: '/', label: 'Dashboard', exact: true, icon: GridIcon },
  { to: '/tasks', label: 'Tasks', icon: CheckIcon },
  { to: '/kanban', label: 'Kanban', icon: KanbanIcon },
  { to: '/calendar', label: 'Calendar', icon: CalIcon },
  { to: '/timetable', label: 'Timetable', icon: TimeIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
]

/* ---------------- LAYOUT ---------------- */

export default function AppLayout() {

  const { user, logout } = useAuth()
  const { toggle, isDark } = useTheme()
  const { tasks, fetchTasks } = useTasks()

  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  useEffect(() => { fetchTasks() }, [])

  const pendingCount =
    tasks.filter(t => t.status !== 'completed').length

  const initials =
    user?.name?.split(' ')
      .map(n => n[0])
      .join('')
      .slice(0,2)
      .toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (

    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

      {/* SIDEBAR */}

      <aside className="w-72 flex flex-col bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50">

        {/* LOGO */}

        <div className="h-20 flex items-center px-6 border-b border-white/30 dark:border-slate-800/50">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">

              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>

            </div>

            <div>

              <h1 className="text-xl font-bold text-white">
                Focusly
              </h1>

              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"/>

            </div>

          </div>

        </div>


        {/* NAV */}

        <nav className="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-1">

          <p className="text-xs font-bold text-slate-400 px-2 mb-2">
            WORKSPACE
          </p>

          {navItems.map(({ to, label, exact, icon: Icon }) => (

            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => clsx(

                'flex items-center gap-4 p-4 rounded-xl text-sm transition',

                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-slate-300 hover:bg-white/10'

              )}
            >

              <Icon size={18}/>

              {label}

              {label === 'Tasks' && pendingCount > 0 && (
                <span className="ml-auto text-xs">
                  {pendingCount}
                </span>
              )}

            </NavLink>

          ))}

        </nav>


        {/* USER */}

        <div className="p-4 border-t border-white/20">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {initials}
            </div>

            <div className="text-sm">

              <div className="text-white font-medium">
                {user?.name}
              </div>

              <div className="text-xs text-slate-400">
                {user?.email}
              </div>

            </div>

          </div>

        </div>

      </aside>


      {/* MAIN */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}

        <header className="h-20 flex items-center gap-4 px-6 border-b border-white/20 bg-white/5 backdrop-blur-xl">

          <div className="flex-1 max-w-md relative">

            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

            <input
              placeholder="Search tasks, notes, projects..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />

          </div>


          <button onClick={toggle} className="p-3">

            {isDark ? <SunIcon/> : <MoonIcon/>}

          </button>


          <button
            onClick={() => navigate('/tasks?new=1')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >

            <PlusIcon size={16}/>

            New Task

          </button>

        </header>


        {/* PAGE */}

        <main className="flex-1 overflow-y-auto p-6">

          <Outlet/>

        </main>

      </div>

    </div>

  )

}