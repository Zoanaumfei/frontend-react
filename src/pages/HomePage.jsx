import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../auth/auth.service'
import { GROUPS } from '../auth/auth.constants.js'
import { hasGroup } from '../auth/auth.groups.js'

function HomePage() {
  const navigate = useNavigate()
  const eyeOpenIcon = '/icons/eye-open.png'
  const eyeClosedIcon = '/icons/eye-closed.png'
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
  const [showInternalPassword, setShowInternalPassword] = useState(false)
  const [showExternalPassword, setShowExternalPassword] = useState(false)

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
        setInternalError('Esta conta não está autorizada para acesso interno.')
        return
      }
      navigate('/internal-home')
    } catch (err) {
      const message =
        err?.message ||
        err?.code ||
        'Não foi possível entrar. Verifique suas credenciais.'
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
        setExternalError('Esta conta não está autorizada para acesso externo.')
        return
      }
      navigate('/external-dashboard')
    } catch (err) {
      const message =
        err?.message ||
        err?.code ||
        'Não foi possível entrar. Verifique suas credenciais.'
      setExternalError(message)
    } finally {
      setIsExternalLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-page__main">
        <div className="login-hero">
          <p className="login-hero__eyebrow">PROVA DE CONCEITO - MVP 1.0</p>
          <h1>Portal de fornecedores.</h1>
          <p className="login-hero__lead">
            Entre para gerenciar solicitações, acompanhar o status e colaborar
            com nossas equipes em uma experiência segura.
          </p>

          <div className="login-hero__grid">
            <div className="login-hero__item">
              <h3>Prova de conceito</h3>
              <p>Projeto para testar o conceito de Portal para fornecedores.</p>
            </div>
            <div className="login-hero__item">
              <h3>Painel visual</h3>
              <p>Acompanhe solicitações, eventos, e estratégia.</p>
            </div>
            <div className="login-hero__item">
              <h3>Informativo</h3>
              <p>Ter os informativos centralizados em um unico lugar.</p>
            </div>
          </div>
        </div>

        <div className="login-panels" aria-live="polite">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Acesso interno</h2>
              <p>Para colaboradores.</p>
            </div>
            <form className="login-form" onSubmit={handleInternalSubmit}>
              <label className="login-form__field">
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={internalForm.email}
                  onChange={event => handleChange(event, setInternalForm)}
                  disabled={isInternalLoading}
                  required
                />
              </label>
              <label className="login-form__field login-form__field--with-toggle">
                <span>Senha</span>
                <input
                  type={showInternalPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="********"
                  value={internalForm.password}
                  onChange={event => handleChange(event, setInternalForm)}
                  disabled={isInternalLoading}
                  required
                />
                <button
                  type="button"
                  className="login-form__toggle"
                  aria-label={showInternalPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onMouseDown={() => setShowInternalPassword(true)}
                  onMouseUp={() => setShowInternalPassword(false)}
                  onMouseLeave={() => setShowInternalPassword(false)}
                  onTouchStart={() => setShowInternalPassword(true)}
                  onTouchEnd={() => setShowInternalPassword(false)}
                  disabled={isInternalLoading}
                >
                  <img
                    src={showInternalPassword ? eyeOpenIcon : eyeClosedIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
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
                  <span>Manter conectado</span>
                </label>
                <Link className="login-form__link" to="/forgot-password">
                  Esqueci minha senha
                </Link>
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
                {isInternalLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <div className="login-card">
            <div className="login-card__header">
              <h2>Acesso externo</h2>
              <p>Para parceiros.</p>
            </div>
            <form className="login-form" onSubmit={handleExternalSubmit}>
              <label className="login-form__field">
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="voce@parceiro.com"
                  value={externalForm.email}
                  onChange={event => handleChange(event, setExternalForm)}
                  disabled={isExternalLoading}
                  required
                />
              </label>
              <label className="login-form__field login-form__field--with-toggle">
                <span>Senha</span>
                <input
                  type={showExternalPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="********"
                  value={externalForm.password}
                  onChange={event => handleChange(event, setExternalForm)}
                  disabled={isExternalLoading}
                  required
                />
                <button
                  type="button"
                  className="login-form__toggle"
                  aria-label={showExternalPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onMouseDown={() => setShowExternalPassword(true)}
                  onMouseUp={() => setShowExternalPassword(false)}
                  onMouseLeave={() => setShowExternalPassword(false)}
                  onTouchStart={() => setShowExternalPassword(true)}
                  onTouchEnd={() => setShowExternalPassword(false)}
                  disabled={isExternalLoading}
                >
                  <img
                    src={showExternalPassword ? eyeOpenIcon : eyeClosedIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
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
                  <span>Manter conectado</span>
                </label>
                <Link className="login-form__link" to="/forgot-password">
                  Esqueci minha senha
                </Link>
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
                {isExternalLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>

    </section>
  )
}

export default HomePage
