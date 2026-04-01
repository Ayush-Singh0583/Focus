import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PermissionsPage() {

  const navigate = useNavigate()

  const [permissions, setPermissions] = useState({
    notifications: false,
    reminders: false,
  })

  const handleToggle = (key) => {

    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))

  }

  const handleContinue = () => {

    localStorage.setItem(
      "focusly_permissions",
      JSON.stringify(permissions)
    )

    navigate('/dashboard')

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">

      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-[420px]">

        <h2 className="text-xl font-semibold mb-2 text-white">
          Customize your experience
        </h2>

        <p className="text-slate-400 mb-6">
          Choose what you want to enable
        </p>


        <div className="space-y-4">

          <div
            className="flex items-center justify-between p-3 bg-slate-800 rounded-xl cursor-pointer"
            onClick={() => handleToggle("notifications")}
          >
            <span className="text-white">
              Enable Notifications 🔔
            </span>

            <input
              type="checkbox"
              checked={permissions.notifications}
              readOnly
            />
          </div>


          <div
            className="flex items-center justify-between p-3 bg-slate-800 rounded-xl cursor-pointer"
            onClick={() => handleToggle("reminders")}
          >
            <span className="text-white">
              Enable Productivity Reminders ⏰
            </span>

            <input
              type="checkbox"
              checked={permissions.reminders}
              readOnly
            />
          </div>

        </div>


        <button
          onClick={handleContinue}
          className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl"
        >
          Continue
        </button>

      </div>

    </div>

  )

}