import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('focusly_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Verify session on mount
  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authApi.me()
        setUser(data.user)
        localStorage.setItem('focusly_user', JSON.stringify(data.user))
      } catch {
        setUser(null)
        localStorage.removeItem('focusly_user')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    verify()
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    setUser(data.user)
    localStorage.setItem('focusly_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const register = useCallback(async (credentials) => {
    const { data } = await authApi.register(credentials)
    setUser(data.user)
    localStorage.setItem('focusly_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    setUser(null)
    localStorage.removeItem('focusly_user')
    localStorage.removeItem('focusly_tasks_cache')
  }, [])

  const updateUser = useCallback(async (data) => {
    const { data: res } = await authApi.updateMe(data)
    setUser(res.user)
    localStorage.setItem('focusly_user', JSON.stringify(res.user))
    return res.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
