import { useEffect, useState } from 'react'
import { getUsers } from '../services/userService'

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadUsers = async () => {
      try {
        const data = await getUsers()
        if (active) {
          setUsers(Array.isArray(data) ? data : [])
          setError('')
        }
      } catch (err) {
        if (active) {
          setError('Unable to load users.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="card">
      <h1>Users</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error && users.length === 0 ? <p>No users found.</p> : null}
      {!loading && !error && users.length > 0 ? (
        <ul className="list">
          {users.map(user => (
            <li key={user.id ?? user.email ?? user.username ?? JSON.stringify(user)}>
              {user.name ?? user.email ?? user.username ?? 'User'}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default UsersPage
