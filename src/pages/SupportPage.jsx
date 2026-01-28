function SupportPage() {
  return (
    <section className="card" aria-labelledby="support-title">
      <p className="dashboard__eyebrow">Suporte</p>
      <h1 id="support-title">Obtenha ajuda com acesso e problemas.</h1>
      <p className="dashboard__lead">
        Se você precisa de acesso ao portal, tem um problema técnico ou precisa escalar um risco
        de entrega, comece pelas opções de suporte abaixo.
      </p>
      <ul className="dashboard__bullets">
        <li>Envie um e-mail para o suporte : portaldefornecedores@poc.com</li>
        <li>Fale com seu líder de programa assuntos urgentes.</li>
      </ul>
      <p className="dashboard__note">
        Caso necessário entre em contato via telefone com nossa equipe de suporte: +55 (11) 99999-9999
      </p>
    </section>
  )
}

export default SupportPage
