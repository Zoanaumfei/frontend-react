import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createBirthday, deleteBirthday, getBirthdays } from '../services/birthdayService'
import { FILE_UPLOAD_REFERENCES } from '../constants'
import { uploadFileWithPresign } from '../utils/fileTransfer'

function MonthlyBirthdaysManagementPage() {
  const maxPhotoSizeBytes = 10 * 1024 * 1024
  const [formData, setFormData] = useState({
    month: 5,
    day: 18,
    name: 'Maria Silva',
    year: 1992,
    corporateMonth: 6,
    corporateYear: 2021,
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filters, setFilters] = useState({ month: '', name: '' })
  const [birthdays, setBirthdays] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [listError, setListError] = useState('')
  const [lastQuery, setLastQuery] = useState({})

  const handleChange = event => {
    const { name, value, type } = event.target
    const nextValue = type === 'number' ? value : value
    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
    }))
  }

  const handleFilterChange = event => {
    const { name, value, type } = event.target
    const nextValue = type === 'number' ? value : value
    setFilters(prev => ({
      ...prev,
      [name]: nextValue,
    }))
  }

  const fetchBirthdays = async (params = {}) => {
    setIsLoading(true)
    setListError('')
    setLastQuery(params)
    setBirthdays([])
    try {
      const data = await getBirthdays(params)
      setBirthdays(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load birthdays:', error)
      setListError('Failed to load birthdays. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (photoError) {
        setErrorMessage(photoError)
        return
      }
      let photoKey = null
      if (photoFile) {
        const { key } = await uploadFileWithPresign(
          photoFile,
          FILE_UPLOAD_REFERENCES.monthlyBirthdayPhoto,
          { errorMessage: 'Failed to upload photo.' },
        )
        photoKey = key
      }

      const payload = {
        ...formData,
        day: Number(formData.day),
        month: Number(formData.month),
        year: Number(formData.year),
        corporate_month: Number(formData.corporateMonth),
        corporate_year: Number(formData.corporateYear),
        ...(photoKey ? { photo_key: photoKey } : {}),
      }
        await createBirthday(payload)
        setSuccessMessage('Birthday added successfully.')
        setPhotoFile(null)
        setPhotoError('')
        fetchBirthdays(lastQuery)
    } catch (error) {
      console.error('Failed to add birthday:', error)
      setErrorMessage('Failed to add birthday. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearch = event => {
    event.preventDefault()
    const params = {}
    if (filters.month) params.month = Number(filters.month)
    const trimmedName = filters.name.trim()
    if (trimmedName) params.name = trimmedName
    fetchBirthdays(params)
  }

  const handleDelete = async record => {
    if (!record?.month || !record?.name) return
    const confirmDelete = window.confirm(
      `Delete birthday for ${record.name} (month ${record.month})?`,
    )
    if (!confirmDelete) return

    try {
      await deleteBirthday(record.month, record.name)
      setBirthdays(prev =>
        prev.filter(
          item => !(item.month === record.month && item.name === record.name),
        ),
      )
    } catch (error) {
      console.error('Failed to delete birthday:', error)
      setListError('Failed to delete birthday. Please try again.')
    }
  }

  return (
    <section className="card">
      <p className="dashboard__eyebrow">Monthly birthdays</p>
      <h1>Manage birthdays</h1>
      <p className="dashboard__lead">
        Add, update, or remove birthday entries.
      </p>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-form__field" htmlFor="birthdayName">
          Name
          <input
            id="birthdayName"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <div className="login-form login-form--three-column">
          <label className="login-form__field" htmlFor="birthdayMonth">
            Month
            <input
              id="birthdayMonth"
              name="month"
              type="number"
              min="1"
              max="12"
              value={formData.month}
              onChange={handleChange}
              required
            />
          </label>
          <label className="login-form__field" htmlFor="birthdayDay">
            Day
            <input
              id="birthdayDay"
              name="day"
              type="number"
              min="1"
              max="31"
              value={formData.day}
              onChange={handleChange}
              required
            />
          </label>
          <label className="login-form__field" htmlFor="birthdayYear">
            Year
            <input
              id="birthdayYear"
              name="year"
              type="number"
              min="1900"
              max="2100"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="login-form login-form--two-column">
          <label className="login-form__field" htmlFor="corporateMonth">
            Corporate Month
            <input
              id="corporateMonth"
              name="corporateMonth"
              type="number"
              min="1"
              max="12"
              value={formData.corporateMonth}
              onChange={handleChange}
              required
            />
          </label>
          <label className="login-form__field" htmlFor="corporateYear">
            Corporate Year
            <input
              id="corporateYear"
              name="corporateYear"
              type="number"
              min="1900"
              max="2100"
              value={formData.corporateYear}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="login-form__field" htmlFor="birthdayPhoto">
          Photo
          <input
            id="birthdayPhoto"
            name="photo"
            type="file"
            accept="image/*"
            onChange={event => {
              const file = event.target.files?.[0] || null
              if (!file) {
                setPhotoFile(null)
                setPhotoError('')
                return
              }
              if (!file.type.startsWith('image/')) {
                setPhotoFile(null)
                setPhotoError('Selecione apenas imagens.')
                return
              }
              if (file.size > maxPhotoSizeBytes) {
                setPhotoFile(null)
                setPhotoError('O arquivo deve ter no máximo 10MB.')
                return
              }
              setPhotoError('')
              setPhotoFile(file)
            }}
          />
        </label>
        {photoError && <p className="login-form__error">{photoError}</p>}
        {!photoError && (
          <p className="login-form__hint">Máximo 10MB. Apenas imagens.</p>
        )}
        <button type="submit" className="login-form__submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Add birthday'}
        </button>
        {errorMessage && <p className="login-form__error">{errorMessage}</p>}
        {successMessage && (
          <p className="login-form__success">{successMessage}</p>
        )}
      </form>
      <div className="dashboard__actions dashboard__actions--spaced">
        <form className="login-form login-form--two-column" onSubmit={handleSearch}>
          <label className="login-form__field" htmlFor="filterMonth">
            Search Month
            <input
              id="filterMonth"
              name="month"
              type="number"
              min="1"
              max="12"
              value={filters.month}
              onChange={handleFilterChange}
            />
          </label>
          <label className="login-form__field" htmlFor="filterName">
            Search Name
            <input
              id="filterName"
              name="name"
              type="text"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Maria"
            />
          </label>
          <button type="submit" className="login-form__submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      <div className="monthly-birthdays__table-wrap">
        <table className="monthly-birthdays__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Month</th>
              <th>Day</th>
              <th>Year</th>
              <th>Corporate Month</th>
              <th>Corporate Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7}>No birthdays found.</td>
              </tr>
            ) : (
              birthdays.map(record => (
                <tr key={`${record.month}-${record.name}`}>
                  <td>{record.name}</td>
                  <td>{record.month}</td>
                  <td>{record.day}</td>
                  <td>{record.year}</td>
                  <td>{record.corporate_month}</td>
                  <td>{record.corporate_year}</td>
                  <td>
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => handleDelete(record)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {listError && <p className="login-form__error">{listError}</p>}
      </div>
      <div className="dashboard__actions dashboard__actions--spaced">
        <Link className="request-card__action" to="/monthly-birthdays">
          Back to Monthly Birthdays
        </Link>
      </div>
    </section>
  )
}

export default MonthlyBirthdaysManagementPage
