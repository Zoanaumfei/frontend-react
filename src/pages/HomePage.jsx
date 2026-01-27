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
          <p className="login-hero__eyebrow">Portal de Fornecedores Oryzem</p>
          <h1>Um portal para cada fluxo do fornecedor.</h1>
          <p className="login-hero__lead">
            Entre para gerenciar solicitações, acompanhar o status e colaborar
            com nossas equipes internas em uma única experiência segura.
          </p>

          <div className="login-hero__grid">
            <div className="login-hero__item">
              <h3>Acesso centralizado</h3>
              <p>Uma camada de identidade para cada recurso do fornecedor.</p>
            </div>
            <div className="login-hero__item">
              <h3>Pronto para auditoria</h3>
              <p>Acompanhe aprovações, atualizações e decisões de entrega.</p>
            </div>
            <div className="login-hero__item">
              <h3>Recuperação rápida</h3>
              <p>Redefina senhas instantaneamente com os fluxos do Cognito.</p>
            </div>
          </div>
        </div>

        <div className="login-panels" aria-live="polite">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Acesso interno</h2>
              <p>Para colaboradores e equipes internas.</p>
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
              <label className="login-form__field">
                <span>Senha</span>
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
                  <span>Manter conectado</span>
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
                {isInternalLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <div className="login-card">
            <div className="login-card__header">
              <h2>Acesso externo</h2>
              <p>Para parceiros e colaboradores confiáveis.</p>
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
              <label className="login-form__field">
                <span>Senha</span>
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
                  <span>Manter conectado</span>
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

