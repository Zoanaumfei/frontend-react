import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userPool } from '../auth/auth.cognito.js'
import { GROUPS, ROUTES } from '../auth/auth.constants.js'
import { hasGroup } from '../auth/auth.groups.js'
import { saveTokens } from '../auth/auth.tokens.js'

const readFirstAccessData = () => {
  try {
    const raw = sessionStorage.getItem('FIRST_ACCESS')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const sanitizeAttributes = attributes => {
  if (!attributes || typeof attributes !== 'object') return {}
  const next = { ...attributes }
  delete next.email
  delete next.email_verified
  delete next.phone_number_verified
  delete next.phone_number
  delete next.sub
  return next
}

const passwordRules = [
  {
    id: 'length',
    label: 'Tamanho mínimo da senha: 8 caracteres',
    test: value => value.length >= 8,
  },
  {
    id: 'number',
    label: 'Contém pelo menos 1 número',
    test: value => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'Contém pelo menos 1 caractere especial',
    test: value => /[^A-Za-z0-9]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'Contém pelo menos 1 letra maiúscula',
    test: value => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Contém pelo menos 1 letra minúscula',
    test: value => /[a-z]/.test(value),
  },
]

function FirstAccessPage() {
  const navigate = useNavigate()
  const firstAccessData = useMemo(() => readFirstAccessData(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [givenName, setGivenName] = useState(
    firstAccessData?.attributes?.given_name || '',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    if (isLoading) return

    if (!firstAccessData?.username || !firstAccessData?.session) {
      setErrorMessage('Sessão inválida. Faça login novamente.')
      return
    }

    if (!password) {
      setErrorMessage('Digite uma nova senha.')
      return
    }

    const isPasswordValid = passwordRules.every(rule => rule.test(password))
    if (!isPasswordValid) {
      setErrorMessage('A senha não atende aos requisitos.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não conferem.')
      return
    }

    if (!givenName.trim()) {
      setErrorMessage('Informe o nome.')
      return
    }

    const { AmazonCognitoIdentity } = window
    if (!AmazonCognitoIdentity?.CognitoUser) {
      setErrorMessage('AmazonCognitoIdentity não está disponível.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    const user = new AmazonCognitoIdentity.CognitoUser({
      Username: firstAccessData.username,
      Pool: userPool,
    })
    user.Session = firstAccessData.session

    user.completeNewPasswordChallenge(
      password,
      {
        ...sanitizeAttributes(firstAccessData.attributes),
        given_name: givenName.trim(),
      },
      {
        onSuccess: result => {
          saveTokens(
            {
              idToken: result.getIdToken().getJwtToken(),
              accessToken: result.getAccessToken().getJwtToken(),
              refreshToken: result.getRefreshToken().getToken(),
            },
            false,
          )
          sessionStorage.removeItem('FIRST_ACCESS')

          if (hasGroup(GROUPS.INTERNAL, GROUPS.ADMIN)) {
            navigate(ROUTES.INTERNAL, { replace: true })
            return
          }
          if (hasGroup(GROUPS.EXTERNAL, GROUPS.ADMIN)) {
            navigate(ROUTES.EXTERNAL, { replace: true })
            return
          }
          navigate(ROUTES.LOGIN, { replace: true })
        },
        onFailure: err => {
          const message =
            err?.message ||
            err?.code ||
            'Não foi possível atualizar a senha.'
          setErrorMessage(message)
          setIsLoading(false)
        },
      },
    )
  }

  return (
    <section className="login-page">
      <div className="login-page__main">
        <div className="login-hero">
          <p className="login-hero__eyebrow">Primeiro acesso</p>
          <h1>Defina sua nova senha.</h1>
          <p className="login-hero__lead">
            Complete o primeiro acesso para continuar.
          </p>
        </div>
        <div className="login-panels" aria-live="polite">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Nova senha</h2>
              <p>Crie uma senha segura para sua conta.</p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-form__field">
                <span>Nome</span>
                <input
                  type="text"
                  name="givenName"
                  placeholder="Seu nome"
                  value={givenName}
                  onChange={event => setGivenName(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </label>
              <label className="login-form__field">
                <span>Nova senha</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="********"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </label>
              <ul className="list login-form__hint password-rules">
                {passwordRules.map(rule => {
                  const passed = rule.test(password)
                  return (
                    <li
                      key={rule.id}
                      className={`password-rule${
                        passed ? ' password-rule--ok' : ''
                      }`}
                    >
                      <span className="password-rule__icon" aria-hidden="true">
                        {passed ? '✓' : '•'}
                      </span>
                      <span>{rule.label}</span>
                    </li>
                  )
                })}
              </ul>
              <label className="login-form__field">
                <span>Confirmar senha</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </label>
              {errorMessage ? (
                <p className="login-form__error" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              <p className="login-form__hint">
                Campos obrigatórios: nome e nova senha.
              </p>
              <button
                className="login-form__submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FirstAccessPage
