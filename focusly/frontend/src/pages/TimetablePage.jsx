import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import timetableImg from './image_1.png'
export default function TimetablePage() {
  const navigate = useNavigate()
  
  const timeSlots = [
    "9:00-10:00", "10:00-11:00", "11:00-11:20", "11:20-12:20",
    "12:20-1:20", "1:20-2:00", "2:00-3:00", "3:00-4:00"
  ]

  const timetable = {
    Monday: ["ML", "FSD", "Break", "Lab", "Lab", "Lunch", "NSS/Yoga", ""],
    Tuesday: ["FSD", "Cloud", "Break", "ML", "IKS", "Lunch", "DevOps", ""],
    Wednesday: ["Cloud", "FSD", "Break", "ML", "REP", "Lunch", "Project", ""],
    Thursday: ["REP", "ML", "Break", "Lab", "Project", "Lunch", "", ""],
    Friday: ["Lab", "Lab", "Break", "Cloud", "REP", "Lunch", "", ""],
    Saturday: ["", "", "Break", "", "", "Lunch", "", ""],
  }

  const getSlotColor = (item) => {
    if (item === "Break") return "from-yellow-400/20 via-yellow-500/20 to-orange-400/20 dark:from-yellow-500/30 dark:via-amber-500/30 dark:to-orange-500/30"
    if (item === "Lunch") return "from-emerald-400/20 via-green-500/20 to-emerald-600/20 dark:from-emerald-500/30 dark:via-green-600/30 dark:to-emerald-700/30"
    if (item) return "from-blue-400/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-600/20 dark:to-purple-600/20"
    return "from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50"
  }

  const getSlotBadge = (item) => {
    if (item === "Break") return { emoji: "⏸️", color: "from-yellow-400 to-orange-500" }
    if (item === "Lunch") return { emoji: "🍱", color: "from-emerald-500 to-green-600" }
    return null
  }

  const goBack = () => navigate(-1)

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col overflow-hidden">
      
      {/* ✨ Back Button + Premium Header */}
      <div className="mb-6 flex items-start gap-4">
        
        {/* Back Button */}
        <button
          onClick={goBack}
          className="group relative p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl hover:bg-white dark:hover:bg-slate-700 shadow-lg hover:shadow-xl border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="sr-only">Go Back</span>
        </button>

        {/* Premium Floating Header */}
        <div className="flex-1 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 -z-10" />
          <div className="relative z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-2">
                <img 
                src={timetableImg}
                alt="Timetable"
                className="w-10 h-10 object-contain drop-shadow-lg"
                />

            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-indigo-100 dark:via-white dark:to-slate-200 leading-tight">
                Weekly Timetable
            </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium bg-gradient-to-r from-transparent via-white/80 to-transparent bg-clip-text">
              Your complete class schedule at a glance
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 Ultra Premium Glass Table - SAME MEASUREMENTS */}
      <div className="flex-1 bg-gradient-to-br from-white/80 via-blue-50/50 to-indigo-50/30 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-indigo-900/30 backdrop-blur-3xl shadow-2xl border border-white/40 dark:border-slate-700/50 rounded-3xl overflow-hidden relative">
        
        {/* Floating Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/3 to-indigo-500/5 rounded-3xl blur-xl animate-pulse" />
        
        {/* Header Row - YOUR EXACT MEASUREMENTS */}
        <div className="bg-gradient-to-r from-indigo-500/95 via-blue-500/95 to-purple-600/95 backdrop-blur-xl border-b border-white/30 p-1 relative overflow-hidden">
          <div className="grid grid-cols-[140px_repeat(8,1fr)]">
            <div className="p-4 font-black text-lg text-white/95 drop-shadow-lg border-r border-white/30 backdrop-blur-sm">
              Day / Time
            </div>
            {timeSlots.map((time, i) => (
              <div 
                key={i} 
                className="p-4 text-center font-black text-sm text-white/90 drop-shadow-md border-l border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group hover:scale-[1.02]"
              >
                <span className="block">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body - YOUR PERFECT HEIGHT */}
        <div className="h-[calc(100%-88px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-white/50 dark:scrollbar-track-slate-900/50 divide-y divide-white/20 dark:divide-slate-700/40">
          
          {Object.entries(timetable).map(([day, slots], dayIdx) => (
            <div key={day} className="grid grid-cols-[140px_repeat(8,1fr)] hover:bg-white/30 dark:hover:bg-slate-700/40 transition-all duration-500 group">
              
              {/* Day Column */}
              <div className={clsx(
                'p-4 font-bold text-lg border-r border-white/20 backdrop-blur-sm relative overflow-hidden group-hover:scale-[1.01] transition-all duration-300',
                dayIdx % 2 === 0
                  ? 'bg-gradient-to-br from-blue-400/15 via-indigo-500/10 to-purple-500/15 dark:from-blue-950/40 dark:to-purple-950/40 shadow-lg'
                  : 'bg-gradient-to-br from-slate-100/60 to-white/70 dark:from-slate-900/60 dark:to-slate-800/70 shadow-md'
              )}>
                <div className="relative z-10">
                  <span className="text-slate-900 dark:text-white font-black drop-shadow-md block">{day}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">College</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Time Slots - SEXY UX */}
              {slots.map((item, slotIdx) => {
                const badge = getSlotBadge(item)
                return (
                  <div
                    key={slotIdx}
                    className={clsx(
                      'group/item relative p-3 text-center border-l border-white/10 dark:border-slate-800/50 cursor-pointer transition-all duration-500 h-20 flex items-center justify-center overflow-hidden hover:scale-[1.05] hover:z-10',
                      getSlotColor(item),
                      'hover:shadow-2xl hover:shadow-current/30 hover:border-white/50 backdrop-blur-xl rounded-r-xl mx-0.5 my-1 shadow-lg'
                    )}
                    onClick={() => item && item !== "Break" && item !== "Lunch" && alert(`${day} ${timeSlots[slotIdx]}: ${item}`)}
                  >
                    {/* Shine Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent dark:from-slate-900/40 skew-x-12 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-2 transition-all duration-700" />
                    
                    {/* Floating Badge */}
                    {badge && (
                      <div className={clsx(
                        "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-black text-white shadow-lg transform -rotate-12 scale-0 group-hover/item:scale-100 transition-all duration-300",
                        `bg-gradient-to-r ${badge.color}`
                      )}>
                        {badge.emoji}
                      </div>
                    )}
                    
                    {/* Main Content */}
                    <div className="relative z-20 w-full h-full flex items-center justify-center">
                      {item ? (
                        <div className="font-bold text-base bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent drop-shadow-lg px-2 py-1 rounded-lg backdrop-blur-sm">
                          {item}
                        </div>
                      ) : (
                        <div className="w-12 h-12 border-2 border-dashed border-slate-300/50 dark:border-slate-600/50 rounded-xl flex items-center justify-center group-hover/item:bg-slate-100/50 dark:group-hover/item:bg-slate-800/50 transition-all duration-300">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Free</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/60 to-purple-500/60 rounded-b-xl scale-x-0 group-hover/item:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                )
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
