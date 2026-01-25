import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../auth/auth.service'
import { GROUPS } from '../auth/auth.constants.js'
import { hasGroup } from '../auth/auth.groups.js'

function HomePage() {
  const navigate = useNavigate()
  const [internalForm, setInternalForm] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [externalForm, setExternalForm] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [internalError, setInternalError] = useState('')
  const [externalError, setExternalError] = useState('')
  const [isInternalLoading, setIsInternalLoading] = useState(false)
  const [isExternalLoading, setIsExternalLoading] = useState(false)

  const handleChange = (event, setForm) => {
    const { name, value, type, checked } = event.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleInternalSubmit = async event => {
    event.preventDefault()
    if (isInternalLoading) return

    setInternalError('')
    setIsInternalLoading(true)

    try {
      await login(
        internalForm.email,
        internalForm.password,
        internalForm.remember,
      )
      if (!hasGroup(GROUPS.INTERNAL, GROUPS.ADMIN)) {
        setInternalError('This account is not authorized for internal access.')
        return
      }
      navigate('/internal-dashboard')
    } catch (err) {
      const message =
        err?.message ||
        err?.code ||
        'Unable to sign in. Please check your credentials.'
      setInternalError(message)
    } finally {
      setIsInternalLoading(false)
    }
  }

  const handleExternalSubmit = async event => {
    event.preventDefault()
    if (isExternalLoading) return

    setExternalError('')
    setIsExternalLoading(true)

    try {
      await login(
        externalForm.email,
        externalForm.password,
        externalForm.remember,
      )
      if (!hasGroup(GROUPS.EXTERNAL, GROUPS.ADMIN)) {
        setExternalError('This account is not authorized for external access.')
        return
      }
      navigate('/external-dashboard')
    } catch (err) {
      const message =
        err?.message ||
        err?.code ||
        'Unable to sign in. Please check your credentials.'
      setExternalError(message)
    } finally {
      setIsExternalLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-hero">
        <p className="login-hero__eyebrow">Oryzem Console</p>
        <h1>Sign in to keep your data pipeline moving.</h1>
        <p className="login-hero__lead">
          Secure access powered by AWS Cognito and tailored for teams running
          production workloads.
        </p>
        <div className="login-hero__grid">
          <div className="login-hero__item">
            <h3>Centralized access</h3>
            <p>One identity layer across every service.</p>
          </div>
          <div className="login-hero__item">
            <h3>Audit ready</h3>
            <p>Track every sign-in and action in real time.</p>
          </div>
          <div className="login-hero__item">
            <h3>Fast recovery</h3>
            <p>Reset passwords instantly with Cognito flows.</p>
          </div>
        </div>
      </div>

      <div className="login-panels" aria-live="polite">
        <div className="login-card">
          <div className="login-card__header">
            <h2>Internal access</h2>
            <p>For employees and internal teams.</p>
          </div>
          <form className="login-form" onSubmit={handleInternalSubmit}>
            <label className="login-form__field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={internalForm.email}
                onChange={event => handleChange(event, setInternalForm)}
                disabled={isInternalLoading}
                required
              />
            </label>
            <label className="login-form__field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="********"
                value={internalForm.password}
                onChange={event => handleChange(event, setInternalForm)}
                disabled={isInternalLoading}
                required
              />
            </label>
            <div className="login-form__row">
              <label className="login-form__checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={internalForm.remember}
                  onChange={event => handleChange(event, setInternalForm)}
                  disabled={isInternalLoading}
                />
                <span>Keep me signed in</span>
              </label>
            </div>
            {internalError ? (
              <p className="login-form__error" role="alert">
                {internalError}
              </p>
            ) : null}
            <button
              className="login-form__submit"
              type="submit"
              disabled={isInternalLoading}
            >
              {isInternalLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="login-card">
          <div className="login-card__header">
            <h2>External access</h2>
            <p>For partners and trusted collaborators.</p>
          </div>
          <form className="login-form" onSubmit={handleExternalSubmit}>
            <label className="login-form__field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@partner.com"
                value={externalForm.email}
                onChange={event => handleChange(event, setExternalForm)}
                disabled={isExternalLoading}
                required
              />
            </label>
            <label className="login-form__field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="********"
                value={externalForm.password}
                onChange={event => handleChange(event, setExternalForm)}
                disabled={isExternalLoading}
                required
              />
            </label>
            <div className="login-form__row">
              <label className="login-form__checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={externalForm.remember}
                  onChange={event => handleChange(event, setExternalForm)}
                  disabled={isExternalLoading}
                />
                <span>Keep me signed in</span>
              </label>
            </div>
            {externalError ? (
              <p className="login-form__error" role="alert">
                {externalError}
              </p>
            ) : null}
            <button
              className="login-form__submit"
              type="submit"
              disabled={isExternalLoading}
            >
              {isExternalLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default HomePage
