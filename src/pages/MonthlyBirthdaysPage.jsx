const birthdays = [
  {
    id: 'BDAY-001',
    name: 'Ana Silva',
    area: 'Compras',
    birthday: '2026-01-05',
    note: 'Enviar mensagem no Teams',
  },
  {
    id: 'BDAY-002',
    name: 'Bruno Costa',
    area: 'Qualidade',
    birthday: '2026-01-12',
    note: 'Enviar mensagem no Teams',
  },
  {
    id: 'BDAY-003',
    name: 'Carla Souza',
    area: 'Logistica',
    birthday: '2026-01-18',
    note: 'Enviar mensagem no Teams',
  },
  {
    id: 'BDAY-004',
    name: 'Diego Lima',
    area: 'Engenharia',
    birthday: '2026-01-24',
    note: 'Enviar mensagem no Teams',
  },
  {
    id: 'BDAY-005',
    name: 'Fernanda Alves',
    area: 'PMO',
    birthday: '2026-01-29',
    note: 'Enviar mensagem no Teams',
  },
]

function formatBirthday(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  })
}

function getBirthdayParts(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: '--' }
  }
  return {
    day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', ''),
  }
}

function getInitials(name) {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function MonthlyBirthdaysPage() {
  return (
    <section className="monthly-birthdays monthly-birthdays--playful" aria-labelledby="monthly-birthdays-title">
      <div className="monthly-birthdays__floaters" aria-hidden="true">
        <span className="balloon-float balloon-float--one">🎈</span>
        <span className="balloon-float balloon-float--two">🎈</span>
        <span className="balloon-float balloon-float--three">🎈</span>
      </div>
      <div className="monthly-birthdays__content">
        <header className="monthly-birthdays__hero monthly-birthdays__hero--playful">
          <div>
            <p className="monthly-birthdays__eyebrow">Aniversariantes do mes</p>
            <h1 id="monthly-birthdays-title" className="monthly-birthdays__title">
              Monthly Birthdays
            </h1>
          </div>
          <div className="monthly-birthdays__controls">
            <button type="button" className="monthly-birthdays__new">
              Adicionar aniversariante
            </button>
            <label className="monthly-birthdays__search" aria-label="Buscar aniversariantes">
              <span className="monthly-birthdays__search-icon" aria-hidden="true">
                Buscar
              </span>
              <input type="search" name="birthdaySearch" placeholder="Buscar aniversariantes..." />
            </label>
          </div>
        </header>

        <div className="monthly-birthdays__card monthly-birthdays__card--playful">
          <div className="monthly-birthdays__calendar" role="list">
            {birthdays.map((person, index) => {
              const { day, month } = getBirthdayParts(person.birthday)
              return (
                <article
                  key={person.id}
                  role="listitem"
                  className={`birthday-card birthday-card--tone-${index % 4}`}
                >
                  <div className="birthday-card__date" aria-hidden="true">
                    <span className="birthday-card__day">{day}</span>
                    <span className="birthday-card__month">{month}</span>
                  </div>
                  <div className="birthday-card__content">
                    <div className="birthday-card__avatar">{getInitials(person.name)}</div>
                    <div>
                      <h2 className="birthday-card__name">{person.name}</h2>
                      <p className="birthday-card__meta">{person.area}</p>
                    </div>
                  </div>
                  <p className="birthday-card__note">{person.note}</p>
                  <p className="birthday-card__full-date">{formatBirthday(person.birthday)}</p>
                </article>
              )
            })}
          </div>

          <div className="monthly-birthdays__footer monthly-birthdays__footer--playful">
            <p className="monthly-birthdays__meta">
              Mostrando 1 a {birthdays.length} de {birthdays.length} aniversariantes
            </p>
            <div className="monthly-birthdays__pagination" role="navigation" aria-label="Paginacao">
              <button type="button" className="page-btn" disabled>
                Anterior
              </button>
              <span className="page-btn page-btn--active" aria-current="page">
                1
              </span>
              <button type="button" className="page-btn" disabled>
                Proxima
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MonthlyBirthdaysPage
