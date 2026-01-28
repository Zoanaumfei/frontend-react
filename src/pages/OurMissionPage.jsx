function OurMissionPage() {
  return (
    <section className="card" aria-labelledby="mission-title">
      <p className="dashboard__eyebrow">Nossa missão</p>
      <h1 id="mission-title">Trazer a colaboracao para nosso dia a dia.</h1>
      <p className="dashboard__lead">
        O Portal de Fornecedores reúne equipes internas e externas no mesmo fluxo de
        trabalho para que requisitos, cronogramas e riscos de entrega fiquem visíveis.
      </p>
      <ul className="dashboard__bullets">
        <li>Um só lugar para gerenciar solicitações, status e compromissos de entrega.</li>
        <li>Visibilidade compartilhada entre equipes internas e externas.</li>
        <li>Escalonamento mais rápido quando um bloqueio pode impactar a entrega.</li>
      </ul>
      <p className="dashboard__note">
        Este portal foi pensado para reduzir repasses, melhorar a rastreabilidade e ajudar cada
        equipe a focar na próxima ação mais importante.
      </p>
    </section>
  )
}

export default OurMissionPage
