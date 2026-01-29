import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userPool } from '../auth/auth.cognito.js'

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

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState('request')
  const [cognitoUser, setCognitoUser] = useState(null)

  const requestCode = userEmail => {
    const { AmazonCognitoIdentity } = window
    if (!AmazonCognitoIdentity?.CognitoUser) {
      setErrorMessage('AmazonCognitoIdentity não está disponível.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const user = new AmazonCognitoIdentity.CognitoUser({
      Username: userEmail.trim(),
      Pool: userPool,
    })

    user.forgotPassword({
      onSuccess: () => {
        setSuccessMessage('Código enviado para o e-mail.')
        setStep('confirm')
        setIsLoading(false)
      },
      onFailure: err => {
        const message =
          err?.message || err?.code || 'Não foi possível enviar o código.'
        setErrorMessage(message)
        setIsLoading(false)
      },
      inputVerificationCode: () => {
        setSuccessMessage('Código enviado para o e-mail.')
        setStep('confirm')
        setIsLoading(false)
      },
    })

    setCognitoUser(user)
  }

  const handleRequestCode = event => {
    event.preventDefault()
    if (isLoading) return

    if (!email.trim()) {
      setErrorMessage('Informe o e-mail.')
      return
    }

    requestCode(email)
  }

  const handleResendCode = () => {
    if (isLoading) return
    if (!email.trim()) {
      setErrorMessage('Informe o e-mail.')
      return
    }
    requestCode(email)
  }

  const handleConfirmPassword = event => {
    event.preventDefault()
    if (isLoading) return

    if (!cognitoUser) {
      setErrorMessage('Solicite um novo código antes de continuar.')
      return
    }

    if (!code.trim()) {
      setErrorMessage('Informe o código de confirmação.')
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

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    cognitoUser.confirmPassword(code.trim(), password, {
      onSuccess: () => {
        setSuccessMessage('Senha atualizada com sucesso.')
        setIsLoading(false)
        setTimeout(() => navigate('/', { replace: true }), 800)
      },
      onFailure: err => {
        const message =
          err?.message || err?.code || 'Não foi possível alterar a senha.'
        setErrorMessage(message)
        setIsLoading(false)
      },
    })
  }

  return (
    <section className="login-page">
      <div className="login-page__main">
        <div className="login-hero">
          <p className="login-hero__eyebrow">Recuperar senha</p>
          <h1>Redefina sua senha.</h1>
          <p className="login-hero__lead">
            Solicite o código e cadastre uma nova senha para continuar.
          </p>
        </div>
        <div className="login-panels" aria-live="polite">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Esqueci minha senha</h2>
              <p>
                {step === 'request'
                  ? 'Envie o código para o seu e-mail.'
                  : 'Informe o código e a nova senha.'}
              </p>
            </div>
            <form
              className="login-form"
              onSubmit={step === 'request' ? handleRequestCode : handleConfirmPassword}
            >
              <label className="login-form__field">
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  disabled={isLoading || step === 'confirm'}
                  required
                />
              </label>
              {step === 'confirm' && (
                <>
                  <label className="login-form__field">
                    <span>Código de confirmação</span>
                    <input
                      type="text"
                      name="code"
                      inputMode="numeric"
                      placeholder="123456"
                      value={code}
                      onChange={event => setCode(event.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    className="login-form__link"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    Reenviar código
                  </button>
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
                </>
              )}
              {errorMessage ? (
                <p className="login-form__error" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              {successMessage ? (
                <p className="login-form__success" role="status">
                  {successMessage}
                </p>
              ) : null}
              <button
                className="login-form__submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Processando...'
                  : step === 'request'
                  ? 'Enviar código'
                  : 'Salvar nova senha'}
              </button>
            </form>
            <div className="login-card__footer">
              <Link to="/">Voltar para login</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
