import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ApqpLayout from '../components/apqp/ApqpLayout'
import { getApqpNotifications } from '../services/apqpService'

const dateLabel = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString('en-US')
}

function ApqpNotificationsPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [onlyAssigned, setOnlyAssigned] = useState(false)
  const currentUser = 'Ana Silva'

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      const data = await getApqpNotifications()
      if (!isMounted) return
      setItems(data)
      setIsLoading(false)
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter(item => {
        if (onlyUnread && !item.unread) return false
        if (onlyAssigned && item.assignedTo !== currentUser) return false
        return true
      }),
    [currentUser, items, onlyAssigned, onlyUnread],
  )

  return (
    <ApqpLayout title="Notifications">
      <section className="apqp-page" aria-labelledby="apqp-notifications-title">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">Events</p>
            <h2 id="apqp-notifications-title" className="apqp-page__title">
              Notifications
            </h2>
            <p className="apqp-page__lead">
              Part moves, pending deliverables, overdue alerts, and assignment updates.
            </p>
          </div>
        </header>

        <div className="apqp-filter apqp-filter--inline">
          <label>
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={event => setOnlyUnread(event.target.checked)}
            />
            Unread
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyAssigned}
              onChange={event => setOnlyAssigned(event.target.checked)}
            />
            Assigned to me
          </label>
        </div>

        {isLoading ? (
          <div className="apqp-loading-grid">
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
          </div>
        ) : null}

        {!isLoading && filteredItems.length === 0 ? (
          <article className="apqp-empty-state">
            <h3>No notifications</h3>
            <p>There are no events with the selected filters.</p>
          </article>
        ) : null}

        {!isLoading && filteredItems.length > 0 ? (
          <ul className="apqp-notification-list">
            {filteredItems.map(item => (
              <li key={item.id} className={`apqp-notification${item.unread ? ' apqp-notification--unread' : ''}`}>
                <div>
                  <p className="apqp-notification__type">{item.type}</p>
                  <h3>{item.title}</h3>
                  <p>
                    {dateLabel(item.date)} | Owner: {item.assignedTo}
                  </p>
                </div>
                <Link className="apqp-btn apqp-btn--ghost" to={item.link}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </ApqpLayout>
  )
}

export default ApqpNotificationsPage

