const initiatives = [
  {
    id: 'INIT-001',
    name: 'Transformacao Digital',
    responsible: 'Sarah Thompson',
    startDate: '2023-03-15',
    status: 'in-progress',
  },
  {
    id: 'INIT-002',
    name: 'Melhoria da Experiencia do Cliente',
    responsible: 'John Stevens',
    startDate: '2023-02-10',
    status: 'in-progress',
  },
  {
    id: 'INIT-003',
    name: 'Iniciativa de Sustentabilidade',
    responsible: 'Emily Clark',
    startDate: '2023-01-05',
    status: 'completed',
  },
  {
    id: 'INIT-004',
    name: 'Desenvolvimento de Novos Produtos',
    responsible: 'Michael Brown',
    startDate: '2023-04-02',
    status: 'planning',
  },
  {
    id: 'INIT-005',
    name: 'Programa de Treinamento de Colaboradores',
    responsible: 'David Lee',
    startDate: '2023-05-20',
    status: 'on-hold',
  },
]

const statusLabels = {
  'in-progress': 'Em andamento',
  completed: 'Concluida',
  planning: 'Planejamento',
  'on-hold': 'Em espera',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name) {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function InitiativesHubPage() {
  return (
    <section className="initiatives-hub" aria-labelledby="initiatives-hub-title">
      <header className="initiatives-hub__hero">
        <div>
          <p className="initiatives-hub__eyebrow">Iniciativas em andamento na area</p>
          <h1 id="initiatives-hub-title" className="initiatives-hub__title">
            Initiatives Hub
          </h1>
        </div>
        <div className="initiatives-hub__controls">
          <button type="button" className="initiatives-hub__new">
            Adicionar nova iniciativa
          </button>
          <label className="initiatives-hub__search" aria-label="Buscar iniciativas">
            <span className="initiatives-hub__search-icon" aria-hidden="true">
              Buscar
            </span>
            <input type="search" name="initiativeSearch" placeholder="Buscar iniciativas..." />
          </label>
        </div>
      </header>

      <div className="initiatives-hub__card">
        <div className="initiatives-hub__table-wrap">
          <table className="initiatives-hub__table">
            <thead>
              <tr>
                <th scope="col">Iniciativa</th>
                <th scope="col">Responsavel</th>
                <th scope="col">Data de inicio</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {initiatives.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="initiative-cell">
                      <span className="initiative-cell__icon" aria-hidden="true">
                        {item.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="initiative-cell__text">
                        <strong>{item.name}</strong>
                        <span>{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="responsible-cell">
                      <span className="responsible-cell__avatar" aria-hidden="true">
                        {getInitials(item.responsible)}
                      </span>
                      <span>{item.responsible}</span>
                    </div>
                  </td>
                  <td>{formatDate(item.startDate)}</td>
                  <td>
                    <span className={`status-pill status-pill--${item.status}`}>
                      {statusLabels[item.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="initiatives-hub__footer">
          <p className="initiatives-hub__meta">Mostrando 1 a {initiatives.length} de {initiatives.length} iniciativas</p>
          <div className="initiatives-hub__pagination" role="navigation" aria-label="Paginacao">
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

export default InitiativesHubPage


