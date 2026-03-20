import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const { theme, toggle, isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const setP = (k, v) => setProfileForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      await updateUser({ name: profileForm.name })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required')
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSavingPw(true)
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally { setSavingPw(false) }
  }

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'security', label: 'Security' },
  ]

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-surface-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={profileForm.name} onChange={e => setP('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input opacity-60 cursor-not-allowed" value={profileForm.email} readOnly />
                  <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Switch between light and dark themes</p>
                </div>
                <button onClick={toggle} className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                  isDark ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'
                )}>
                  <span className={clsx(
                    'absolute w-4 h-4 bg-white rounded-full top-1 transition-all duration-200 shadow-sm',
                    isDark ? 'left-6' : 'left-1'
                  )} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => { if (isDark) toggle() }}
                  className={clsx('p-4 rounded-xl border-2 transition-all', !isDark ? 'border-brand-500 bg-brand-50' : 'border-surface-200 dark:border-surface-700')}>
                  <div className="w-full h-16 bg-white border border-surface-200 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-surface-600">Light</span>
                  </div>
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">Light Mode</p>
                </button>
                <button onClick={() => { if (!isDark) toggle() }}
                  className={clsx('p-4 rounded-xl border-2 transition-all', isDark ? 'border-brand-500 bg-brand-500/10' : 'border-surface-200')}>
                  <div className="w-full h-16 bg-surface-900 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-surface-400">Dark</span>
                  </div>
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">Dark Mode</p>
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card p-6">
              <h3 className="section-title mb-5">Change Password</h3>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={e => setPw('newPassword', e.target.value)} />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" value={pwForm.confirm} onChange={e => setPw('confirm', e.target.value)} />
                </div>
                <button type="submit" disabled={savingPw} className="btn-primary">
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
