import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useTasks } from '../../context/TasksContext'
import clsx from 'clsx'

// Icon components
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

function GridIcon({ size }) {
  return (
    <Icon size={size}>
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
    </Icon>
  )
}

function CheckIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </Icon>
  )
}

function KanbanIcon({ size }) {
  return (
    <Icon size={size}>
      <rect x="3" y="3" width="5" height="18"/>
      <rect x="10" y="3" width="5" height="12"/>
      <rect x="17" y="3" width="5" height="15"/>
    </Icon>
  )
}

function CalIcon({ size }) {
  return (
    <Icon size={size}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </Icon>
  )
}

function TimeIcon({ size }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </Icon>
  )
}

function ChartIcon({ size }) {
  return (
    <Icon size={size}>
      <polyline points="18 20 18 10"/>
      <polyline points="12 20 12 4"/>
      <polyline points="6 20 6 14"/>
    </Icon>
  )
}

function SettingsIcon({ size }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </Icon>
  )
}

function LogoutIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </Icon>
  )
}

function MenuIcon({ size }) {
  return (
    <Icon size={size}>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </Icon>
  )
}

function SearchIcon({ size, className }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </Icon>
  )
}

function SunIcon({ size }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </Icon>
  )
}

function MoonIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </Icon>
  )
}

function PlusIcon({ size }) {
  return (
    <Icon size={size}>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </Icon>
  )
}

const navItems = [
  { to: '/', label: 'Dashboard', exact: true, icon: GridIcon },
  { to: '/tasks', label: 'Tasks', icon: CheckIcon },
  { to: '/kanban', label: 'Kanban', icon: KanbanIcon },
  { to: '/calendar', label: 'Calendar', icon: CalIcon },
  { to: '/timetable', label: 'Timetable', icon: TimeIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { toggle, isDark } = useTheme()
  const { tasks, fetchTasks } = useTasks()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  useEffect(() => { fetchTasks() }, [])

  // ✅ FIXED: Sidebar stays open on desktop (lg screens), closes on mobile resize only
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pendingCount = tasks.filter(t => t.status !== 'completed').length
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  const handleLogout = async () => { 
    await logout(); 
    navigate('/login') 
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Premium Glass Sidebar - STAYS OPEN ON DESKTOP */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 shadow-2xl lg:translate-x-0 lg:static lg:z-auto transition-all duration-500 ease-out',
        sidebarOpen ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
      )}>
        {/* Logo Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/30 dark:border-slate-800/50 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-indigo-500/10" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 drop-shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent drop-shadow-lg">
                Focusly
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1 shadow-md" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl border border-blue-200/30 dark:border-blue-500/30 backdrop-blur-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">Workspace</p>
          </div>
          
          {navItems.map(({ to, label, exact, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => clsx(
                'group relative flex items-center gap-4 p-4 rounded-2xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:z-10 backdrop-blur-sm border border-transparent',
                isActive ? 
                  'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/25 scale-105' :
                  'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-700/90 hover:text-slate-900 dark:hover:text-white border-slate-200/50 dark:border-slate-700/50',
                'hover:shadow-blue-500/20 hover:border-blue-300/50 dark:hover:border-blue-400/50'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110',
                location.pathname === to ? 
                  'bg-white/20 backdrop-blur-sm shadow-white/50' : 
                  'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'
              )}>
                <Icon size={18} />
              </div>
              <span className="flex-1">{label}</span>
              
              {label === 'Tasks' && pendingCount > 0 && (
                <div className="text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm bg-gradient-to-r from-orange-400/90 to-red-500/90 text-white border-2 border-white/30">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </div>
              )}
              
              {location.pathname === to && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-full shadow-lg" />
              )}
            </NavLink>
          ))}

          {/* Settings Section */}
          <div className="pt-8 mt-8 border-t border-slate-200/30 dark:border-slate-800/50">
            <p className="px-2 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account</p>
            <NavLink to="/settings" className={({ isActive }) => clsx(
              isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/25 scale-105' : '',
              'group relative flex items-center gap-4 p-4 rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-700/90'
            )}>
              <SettingsIcon size={18} />
              <span>Settings</span>
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="group relative flex items-center gap-4 p-4 w-full rounded-2xl font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-500/10 hover:shadow-md hover:scale-[1.02] transition-all duration-300 bg-white/70 dark:bg-slate-800/70"
            >
              <LogoutIcon size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/20 dark:border-slate-800/50 flex-shrink-0">
          <div 
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate('/settings')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-2xl border-4 border-white/50 dark:border-slate-900/50 flex items-center justify-center text-white text-lg font-black drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="w-2 h-10 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shadow-lg" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-0">
        {/* Glass Topbar */}
        <header className="h-20 flex items-center gap-4 px-6 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/30 dark:border-slate-800/50 shadow-lg flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent dark:from-slate-900/40" />
          
          <button 
            className="lg:hidden p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl hover:bg-white dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-white/50 dark:border-slate-700/50"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={20} />
          </button>

          {/* Glass Search */}
          <div className="flex-1 max-w-md relative ml-4 lg:ml-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks, notes, projects..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => { 
                if(e.key==='Enter' && searchVal) { 
                  navigate(`/tasks?search=${searchVal}`); 
                  setSearchVal('') 
                }
              }}
              className="w-full pl-14 pr-6 py-4 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Theme Toggle */}
            <button 
              onClick={toggle} 
              className="p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl hover:bg-white dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border border-white/50 dark:border-slate-700/50 group"
              title="Toggle theme"
            >
              <div className="relative">
                {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </div>
            </button>
            
            {/* New Task Button - FIXED STRING */}
            <button 
              onClick={() => navigate('/tasks?new=1')} 
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 text-sm"
            >
              <PlusIcon size={16} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
