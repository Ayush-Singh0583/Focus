import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {

  const { login } = useAuth()

  const navigate = useNavigate()

  const [form, setForm] = useState({

    email: '',
    password: ''

  })

  const [loading, setLoading] = useState(false)



  const set = (key, value) => {

    setForm(prev => ({

      ...prev,
      [key]: value

    }))

  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!form.email || !form.password)

      return toast.error('All fields required')

    setLoading(true)

    try {

      await login(form)

      // go to permissions page first
      navigate('/permissions')

    }
    catch (err) {

      toast.error(

        err.message ||
        'Invalid credentials'

      )

    }
    finally {

      setLoading(false)

    }

  }



  return (

    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">

      {/* background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,109,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,109,250,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />



      <div className="relative w-full max-w-sm animate-slide-up">

        {/* logo */}
        <div className="flex items-center justify-center gap-3 mb-10">

          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">

              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>

            </svg>

          </div>

          <span className="font-display text-2xl font-bold text-white">

            Focusly

          </span>

        </div>



        {/* login card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 shadow-modal">

          <h1 className="font-display text-xl font-semibold text-white mb-1.5">

            Welcome back

          </h1>

          <p className="text-sm text-surface-400 mb-8">

            Sign in to your workspace

          </p>



          <form onSubmit={handleSubmit} className="space-y-4">

            <div>

              <label className="label text-surface-400">

                Email

              </label>

              <input

                type="email"

                className="input"

                placeholder="you@example.com"

                value={form.email}

                onChange={e => set('email', e.target.value)}

                autoFocus

              />

            </div>



            <div>

              <label className="label text-surface-400">

                Password

              </label>

              <input

                type="password"

                className="input"

                placeholder="••••••••"

                value={form.password}

                onChange={e => set('password', e.target.value)}

              />

            </div>



            <button

              type="submit"

              disabled={loading}

              className="btn-primary w-full justify-center py-2.5 mt-2"

            >

              {

                loading
                  ? 'Signing in…'
                  : 'Sign in'

              }

            </button>

          </form>



          <p className="text-center text-sm text-surface-500 mt-6">

            No account?{' '}

            <Link

              to="/register"

              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"

            >

              Create one free

            </Link>

          </p>

        </div>

      </div>

    </div>

  )

}