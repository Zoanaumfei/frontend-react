const milestones = [
  {
    id: 'MS-01',
    title: 'Kickoff e alinhamento',
    owner: 'PMO',
    date: '2026-02-02',
    status: 'completed',
    note: 'Workshop com areas-chave e objetivos definidos.',
  },
  {
    id: 'MS-02',
    title: 'Mapa de processos e requisitos',
    owner: 'Processos',
    date: '2026-02-20',
    status: 'completed',
    note: 'Levantamento finalizado e validado com liderancas.',
  },
  {
    id: 'MS-03',
    title: 'Protótipo da solucao',
    owner: 'TI',
    date: '2026-03-15',
    status: 'in-progress',
    note: 'Wireframes aprovados e primeiras integracoes em curso.',
  },
  {
    id: 'MS-04',
    title: 'Integrações criticas',
    owner: 'TI / ERP',
    date: '2026-04-05',
    status: 'in-progress',
    note: 'APIs principais conectadas e testes integrados.',
  },
  {
    id: 'MS-05',
    title: 'Piloto com usuarios',
    owner: 'Operacoes',
    date: '2026-04-25',
    status: 'upcoming',
    note: 'Treinamento e coleta de feedback em progresso.',
  },
  {
    id: 'MS-06',
    title: 'Go-live e monitoramento',
    owner: 'PMO',
    date: '2026-05-20',
    status: 'upcoming',
    note: 'Acompanhamento pos-lancamento e ajustes finos.',
  },
]

const statusLabels = {
  completed: 'Concluido',
  'in-progress': 'Em andamento',
  upcoming: 'Proximo',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getDateParts(value) {
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

function ProjectMilestonesPage() {
  const summary = milestones.reduce(
    (acc, item) => {
      acc.total += 1
      if (item.status === 'completed') acc.completed += 1
      if (item.status === 'in-progress') acc.inProgress += 1
      if (item.status === 'upcoming') acc.upcoming += 1
      return acc
    },
    { total: 0, completed: 0, inProgress: 0, upcoming: 0 }
  )

  return (
    <section className="project-milestones" aria-labelledby="project-milestones-title">
      <header className="project-milestones__hero">
        <div>
          <p className="project-milestones__eyebrow">Roadmap principal</p>
          <h1 id="project-milestones-title" className="project-milestones__title">
            Project Milestones
          </h1>
        </div>
        <div className="project-milestones__summary" role="list">
          <div className="project-milestones__stat" role="listitem">
            <span className="project-milestones__stat-label">Concluidos</span>
            <span className="project-milestones__stat-value">{summary.completed}</span>
          </div>
          <div className="project-milestones__stat" role="listitem">
            <span className="project-milestones__stat-label">Em andamento</span>
            <span className="project-milestones__stat-value">{summary.inProgress}</span>
          </div>
          <div className="project-milestones__stat" role="listitem">
            <span className="project-milestones__stat-label">Proximos</span>
            <span className="project-milestones__stat-value">{summary.upcoming}</span>
          </div>
        </div>
      </header>

      <div className="project-milestones__layout">
        <section className="project-milestones__panel" aria-label="Linha do tempo">
          <h2 className="project-milestones__panel-title">Linha do tempo</h2>
          <ul className="project-milestones__timeline">
            {milestones.map(item => {
              const { day, month } = getDateParts(item.date)
              return (
                <li key={item.id} className={`milestone-card milestone-card--${item.status}`}>
                  <span className="milestone-card__marker" aria-hidden="true" />
                  <div className="milestone-card__date">
                    <span className="milestone-card__day">{day}</span>
                    <span className="milestone-card__month">{month}</span>
                  </div>
                  <div className="milestone-card__body">
                    <div className="milestone-card__header">
                      <h3 className="milestone-card__title">{item.title}</h3>
                      <span className={`milestone-card__status milestone-card__status--${item.status}`}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <p className="milestone-card__meta">Responsavel: {item.owner}</p>
                    <p className="milestone-card__note">{item.note}</p>
                    <p className="milestone-card__full-date">{formatDate(item.date)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="project-milestones__side">
          <div className="project-milestones__card">
            <h3 className="project-milestones__card-title">Visao geral</h3>
            <p className="project-milestones__card-text">
              Foco em entregas criticas para o primeiro semestre, com checkpoints quinzenais.
            </p>
            <div className="project-milestones__progress">
              <div className="project-milestones__progress-bar" style={{ width: `${(summary.completed / summary.total) * 100}%` }} />
            </div>
            <p className="project-milestones__progress-label">
              {summary.completed} de {summary.total} marcos concluidos
            </p>
          </div>

          <div className="project-milestones__legend">
            <div className="project-milestones__legend-item">
              <span className="project-milestones__legend-dot project-milestones__legend-dot--completed" />
              Concluido
            </div>
            <div className="project-milestones__legend-item">
              <span className="project-milestones__legend-dot project-milestones__legend-dot--in-progress" />
              Em andamento
            </div>
            <div className="project-milestones__legend-item">
              <span className="project-milestones__legend-dot project-milestones__legend-dot--upcoming" />
              Proximo
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default ProjectMilestonesPage
