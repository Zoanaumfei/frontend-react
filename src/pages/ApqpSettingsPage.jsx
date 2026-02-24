import ApqpLayout from '../components/apqp/ApqpLayout'

function ApqpSettingsPage() {
  return (
    <ApqpLayout title="Settings">
      <section className="apqp-page">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">System</p>
            <h2 className="apqp-page__title">APQP Settings</h2>
            <p className="apqp-page__lead">
              Global settings placeholder for notification rules, defaults, and integrations.
            </p>
          </div>
        </header>
        <article className="apqp-empty-state">
          <h3>Settings module pending backend integration</h3>
          <p>Use this route as the future entry point for APQP system configuration.</p>
        </article>
      </section>
    </ApqpLayout>
  )
}

export default ApqpSettingsPage

