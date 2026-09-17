import { useState } from 'react'

const SCHOOL_YEARS = ['First-year', 'Sophomore', 'Junior', 'Senior', 'Other']
const PYTHON_EXPERIENCE = ['Yes', 'No']

const FIELD_LABELS = {
  name: 'Your name',
  school_year: 'What year are you?',
  interests: 'Please list a few of your interests?',
  python_experience: 'Do you have python experience?',
}

const EMPTY_FORM = {
  name: '',
  school_year: '',
  interests: '',
  python_experience: '',
  pick_a_partner: '',
}

export default function Survey({ roster, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [missing, setMissing] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function requiredGaps() {
    const gaps = []
    if (!form.name) gaps.push('name')
    if (!form.school_year) gaps.push('school_year')
    if (!form.interests.trim()) gaps.push('interests')
    if (!form.python_experience) gaps.push('python_experience')
    return gaps
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const gaps = requiredGaps()
    setMissing(gaps)
    setSubmitError(null)
    if (gaps.length) return

    setSaving(true)
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          school_year: form.school_year,
          interests: form.interests.trim(),
          python_experience: form.python_experience,
          pick_a_partner: form.pick_a_partner.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Backend responded ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <main className="page">
        <h1>GroupMaker</h1>
        <p className="subtitle">Survey</p>
        <p>Thanks — your responses were saved.</p>
        <button className="nav-link" type="button" onClick={onBack}>
          Back to groups
        </button>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>GroupMaker</h1>
      <p className="subtitle">Survey</p>
      <button className="nav-link" type="button" onClick={onBack}>
        Back to groups
      </button>

      <form className="survey" onSubmit={handleSubmit} noValidate>
        {missing.length > 0 && (
          <p className="error" role="alert">
            Please fill in: {missing.map((key) => FIELD_LABELS[key]).join(', ')}
          </p>
        )}
        {submitError && (
          <p className="error" role="alert">
            Could not save your survey: {submitError}
          </p>
        )}

        <label htmlFor="survey-name">
          Your name
          <select
            id="survey-name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          >
            <option value="">Select your name</option>
            {roster.students.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="survey-year">
          What year are you?
          <select
            id="survey-year"
            value={form.school_year}
            onChange={(e) => update('school_year', e.target.value)}
          >
            <option value="">Select a year</option>
            {SCHOOL_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="survey-interests">
          Please list a few of your interests?
          <textarea
            id="survey-interests"
            rows={4}
            value={form.interests}
            onChange={(e) => update('interests', e.target.value)}
          />
        </label>

        <label htmlFor="survey-python">
          Do you have python experience?
          <select
            id="survey-python"
            value={form.python_experience}
            onChange={(e) => update('python_experience', e.target.value)}
          >
            <option value="">Select an option</option>
            {PYTHON_EXPERIENCE.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="survey-partner">
          Were there any people or projects that caught your eye? If so please
          list the name of the student. (optional)
          <textarea
            id="survey-partner"
            rows={3}
            value={form.pick_a_partner}
            onChange={(e) => update('pick_a_partner', e.target.value)}
          />
        </label>

        <button className="randomize" type="submit" disabled={saving}>
          {saving ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
