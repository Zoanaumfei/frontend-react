function SupportPage() {
  return (
    <section className="card" aria-labelledby="support-title">
      <p className="dashboard__eyebrow">Suporte</p>
      <h1 id="support-title">Obtenha ajuda com acesso, problemas e bloqueios de entrega.</h1>
      <p className="dashboard__lead">
        Se você precisa de acesso ao portal, tem um problema técnico ou precisa escalar um risco
        de entrega, comece pelas opções de suporte abaixo.
      </p>
      <ul className="dashboard__bullets">
        <li>Envie um e-mail para o suporte a fornecedores: suppliers@oryzem.com</li>
        <li>Fale com seu líder de programa na Oryzem para bloqueios urgentes de entrega.</li>
        <li>Inclua o ID do fornecedor, o part number e o marco impactado quando possível.</li>
      </ul>
      <p className="dashboard__note">
        Para a resolução mais rápida, envie capturas de tela, o ID da solicitação (se houver) e a
        etapa exata em que o problema ocorreu.
      </p>
    </section>
  )
}

export default SupportPage
