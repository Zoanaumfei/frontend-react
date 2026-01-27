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
    note: 'Organizar cafe da manha',
  },
  {
    id: 'BDAY-003',
    name: 'Carla Souza',
    area: 'Logistica',
    birthday: '2026-01-18',
    note: 'Reservar sala 3',
  },
  {
    id: 'BDAY-004',
    name: 'Diego Lima',
    area: 'Engenharia',
    birthday: '2026-01-24',
    note: 'Comprar bolo',
  },
  {
    id: 'BDAY-005',
    name: 'Fernanda Alves',
    area: 'PMO',
    birthday: '2026-01-29',
    note: 'Alinhar com RH',
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

function getInitials(name) {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function MonthlyBirthdaysPage() {
  return (
    <section className="monthly-birthdays" aria-labelledby="monthly-birthdays-title">
      <header className="monthly-birthdays__hero">
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

      <div className="monthly-birthdays__card">
        <div className="monthly-birthdays__table-wrap">
          <table className="monthly-birthdays__table">
            <thead>
              <tr>
                <th scope="col">Colaborador</th>
                <th scope="col">Area</th>
                <th scope="col">Aniversario</th>
                <th scope="col">Observacao</th>
              </tr>
            </thead>
            <tbody>
              {birthdays.map(person => (
                <tr key={person.id}>
                  <td>
                    <div className="birthday-cell">
                      <span className="birthday-cell__avatar" aria-hidden="true">
                        {getInitials(person.name)}
                      </span>
                      <div className="birthday-cell__text">
                        <strong>{person.name}</strong>
                        <span>{person.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="birthday-area">{person.area}</span>
                  </td>
                  <td>{formatBirthday(person.birthday)}</td>
                  <td>
                    <span className="birthday-note">{person.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="monthly-birthdays__footer">
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
    </section>
  )
}

export default MonthlyBirthdaysPage
