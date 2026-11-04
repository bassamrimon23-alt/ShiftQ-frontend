import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { OFFICE, resetDemoData, SHIFT } from '../../services/attendanceService'
import { useAttendanceData } from './useAttendanceData'
import { useNow } from './useNow'
import { formatClock, formatHM } from './format'
import CheckPanel from './components/CheckPanel'
import HistoryTable from './components/HistoryTable'
import StatCard from './components/StatCard'
import { statusLabel } from './components/statusMeta'
import WeekChart from './components/WeekChart'
import './components/employee.css'

function Attendance() {
  const { user } = useAuth()
  const { loading, today, history, reload } = useAttendanceData(user.id)
  const now = useNow(30000)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [resetting, setResetting] = useState(false)

  const checkedIn = Boolean(today?.checkInAt)
  const checkedOut = Boolean(today?.checkOutAt)
  const action = !checkedIn ? 'check-in' : !checkedOut ? 'check-out' : null

  let workedMinutes = null
  if (checkedOut) workedMinutes = today.workedMinutes
  else if (checkedIn) workedMinutes = Math.max(0, Math.round((now - new Date(today.checkInAt)) / 60000))

  let reminder = `Remember to check in when you arrive at ${OFFICE.name}.`
  if (checkedOut) reminder = 'You are all set for today. See you tomorrow!'
  else if (checkedIn) reminder = 'Remember to check out when your shift ends.'

  const closeDialog = useCallback(() => setDialogOpen(false), [])

  const handleSuccess = async (text) => {
    await reload()
    setDialogOpen(false)
    setNotice(text)
  }

  const handleReset = async () => {
    setResetting(true)
    await resetDemoData(user.id)
    await reload()
    setNotice(null)
    setResetting(false)
  }

  useEffect(() => {
    if (!notice) return undefined
    const id = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(id)
  }, [notice])

  return (
    <div className="emp-page">
      <div className="emp-head">
        <div>
          <p className="emp-eyebrow">Employee workspace</p>
          <h1 className="emp-title">Attendance</h1>
          <p className="emp-subtitle">Review your shift and record today&apos;s attendance.</p>
        </div>
        <button
          type="button"
          className="emp-btn-brand"
          disabled={loading || !action}
          onClick={() => setDialogOpen(true)}
        >
          {action === 'check-in' ? 'Check in' : action === 'check-out' ? 'Check out' : 'Shift complete'}
        </button>
      </div>

      {notice && (
        <p className="emp-alert emp-alert-success" role="status">
          {notice}
        </p>
      )}

      <div className="emp-grid-stats">
        <StatCard
          label="Current shift"
          value={`${SHIFT.start}–${SHIFT.end}`}
          caption={`Today · ${OFFICE.name}`}
          icon="◷"
          tone="blue"
        />
        <StatCard
          label="Checked in"
          value={checkedIn ? formatClock(today.checkInAt) : '—'}
          caption={checkedIn ? statusLabel(today.status) : 'Not checked in'}
          icon="✓"
          tone="green"
        />
        <StatCard
          label="Hours worked"
          value={workedMinutes == null ? '—' : formatHM(workedMinutes)}
          caption={checkedOut ? 'Final' : checkedIn ? 'Live' : 'Starts at check-in'}
          icon="✧"
          tone="pink"
        />
        <StatCard
          label="Break time"
          value={formatHM(SHIFT.breakMinutes)}
          caption="Unpaid · per shift"
          icon="◉"
          tone="gray"
        />
      </div>

      <div className="emp-grid-2">
        <section className="emp-card" aria-label="Hours this week">
          <div className="emp-card-head">
            <h2>Hours this week</h2>
          </div>
          <WeekChart history={history} now={now} />
        </section>
        <section className="emp-card" aria-label="Attendance reminder">
          <div className="emp-card-head">
            <h2>Attendance reminder</h2>
          </div>
          <p className="emp-muted">{reminder}</p>
        </section>
      </div>

      <HistoryTable history={history} loading={loading} />

      <div className="emp-footer">
        <button type="button" className="emp-reset" onClick={handleReset} disabled={resetting}>
          {resetting ? 'Resetting...' : 'Reset demo data'}
        </button>
      </div>

      {dialogOpen && action && (
        <CheckPanel
          userId={user.id}
          action={action}
          onClose={closeDialog}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default Attendance
