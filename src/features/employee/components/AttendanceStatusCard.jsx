import { Link } from 'react-router-dom'
import { OFFICE, SHIFT } from '../../../services/attendanceService'
import { formatClock, formatHM, formatLongDay } from '../format'
import StatusBadge from './StatusBadge'
import { statusLabel } from './statusMeta'
import './employee.css'

// "Your workday" hero card of the Employee Dashboard: today's shift and attendance status.
function AttendanceStatusCard({ today, loading, now }) {
  const checkedIn = Boolean(today?.checkInAt)
  const checkedOut = Boolean(today?.checkOutAt)

  const title = checkedOut
    ? 'Your workday is complete'
    : checkedIn
      ? 'Your workday is underway'
      : 'Your workday starts here'
  const cta = !checkedIn ? 'Check in now' : !checkedOut ? 'Check out' : null

  let detail = 'Location and QR code are verified when you check in.'
  if (checkedOut) {
    detail = `Checked out at ${formatClock(today.checkOutAt)} · ${formatHM(today.workedMinutes)} worked`
  } else if (checkedIn) {
    detail = `Checked in at ${formatClock(today.checkInAt)} · ${statusLabel(today.status)}`
  }

  return (
    <section className="emp-card emp-hero" aria-label="Today's shift">
      <h2>{title}</h2>
      <p className="emp-hero-date">{formatLongDay(new Date(now))}</p>

      {loading ? (
        <p className="emp-muted">Loading...</p>
      ) : (
        <>
          <div className="emp-hero-time">
            <span>
              {SHIFT.start} – {SHIFT.end}
            </span>
            {checkedIn ? (
              <StatusBadge status={today.status} />
            ) : (
              <StatusBadge status="not_checked_in" tone="amber" />
            )}
          </div>
          <p className="emp-hero-line">
            {SHIFT.name} · {SHIFT.breakMinutes} min unpaid break
          </p>
          <p className="emp-hero-line">{OFFICE.name} · Operations</p>
          <p className={checkedIn ? 'emp-green' : 'emp-muted'}>{detail}</p>
          {today?.earlyExit && (
            <p className="emp-note">
              You checked out before the shift ended. This is marked as an early exit for your
              manager to review.
            </p>
          )}
          {cta && (
            <Link to="/employee/attendance" className="emp-btn-brand emp-hero-cta">
              {cta}
            </Link>
          )}
        </>
      )}
    </section>
  )
}

export default AttendanceStatusCard
