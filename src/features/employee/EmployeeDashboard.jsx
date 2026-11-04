import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getUpcomingShifts, SHIFT } from '../../services/attendanceService'
import { useAttendanceData } from './useAttendanceData'
import { useNow } from './useNow'
import { formatShiftDay, greeting } from './format'
import AttendanceStatusCard from './components/AttendanceStatusCard'
import './components/employee.css'

function EmployeeDashboard() {
  const { user } = useAuth()
  const { loading, today, history, summary } = useAttendanceData(user.id)
  const now = useNow(60000)
  const date = new Date(now)

  const firstName = user.name.split(' ')[0]
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const upcoming = getUpcomingShifts(3)
  const next = upcoming[0]
  const missing = history.find((r) => r.status === 'missing_checkout')
  const onTimePct =
    summary && summary.present > 0
      ? Math.round(((summary.present - summary.late) / summary.present) * 100)
      : null

  return (
    <div className="emp-page">
      <div>
        <p className="emp-eyebrow emp-eyebrow-blue">Employee workspace</p>
        <h1 className="emp-title emp-title-xl">
          {greeting(date)}, {firstName}
        </h1>
        <p className="emp-subtitle">
          A little clarity for the day ahead. Here&apos;s your {weekday} at a glance.
        </p>
      </div>

      <div className="emp-grid-2">
        <AttendanceStatusCard today={today} loading={loading} now={now} />

        {/* Recognition: demo content until the Rewards module provides real data. */}
        <section className="emp-card" aria-label="Recognition">
          <h2>A small win, well earned</h2>
          <p className="emp-card-sub">RECOGNITION</p>
          <span className="emp-pill">Team helper</span>
          <p className="emp-quote">“Thanks for making our launch week feel effortless.”</p>
          <p className="emp-from">From Sara Kim · Product · 16 Oct</p>
          <Link to="/employee/rewards" className="btn">
            View rewards
          </Link>
        </section>
      </div>

      {/* Leave and reward values are demo data; "This month" and "Next shift" come from attendance. */}
      <section className="emp-card emp-strip" aria-label="Summary">
        <div>
          <p className="emp-strip-label">Annual leave</p>
          <p className="emp-strip-value">8 days</p>
          <p className="emp-strip-caption">2 days pending approval</p>
        </div>
        <div>
          <p className="emp-strip-label">Reward balance</p>
          <p className="emp-strip-value">120 pts</p>
          <p className="emp-strip-caption emp-green">+20 earned this month</p>
        </div>
        <div>
          <p className="emp-strip-label">This month</p>
          <p className="emp-strip-value">{onTimePct == null ? '—' : `${onTimePct}%`}</p>
          <p className="emp-strip-caption">On-time attendance</p>
        </div>
        <div>
          <p className="emp-strip-label">Next shift</p>
          <p className="emp-strip-value">
            {next.day.toLocaleDateString('en-GB', { weekday: 'short' })}, {next.day.getDate()}
          </p>
          <p className="emp-strip-caption">
            {next.start} – {next.end} · {next.location}
          </p>
        </div>
      </section>

      <div className="emp-grid-2">
        <section className="emp-card" aria-label="Upcoming schedule">
          <h2>Upcoming schedule</h2>
          <p className="emp-card-sub">Your next three shifts · {SHIFT.name}</p>
          <div className="emp-table-wrap">
            <table className="emp-schedule">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Shift</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((s) => (
                  <tr key={s.date}>
                    <td>{formatShiftDay(s.day)}</td>
                    <td>
                      {s.start} – {s.end}
                    </td>
                    <td>{s.location}</td>
                    <td>{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="emp-schedule-foot">{upcoming.length} upcoming shifts</p>
        </section>

        <section className="emp-card" aria-label="Team announcements">
          <h2>Team announcements</h2>
          <p className="emp-card-sub">From your People team</p>
          <div className="emp-announce" style={{ marginTop: 16 }}>
            <h3>Benefits drop-in this Wednesday</h3>
            <p>Join Maya at 12:30 in the lounge or online to ask your benefits questions.</p>
            <p className="emp-announce-meta">People team</p>
          </div>
          {missing && (
            <div className="emp-announce emp-announce-warn">
              <h3>Correction needed</h3>
              <p>
                Your check-out on {formatShiftDay(new Date(`${missing.date}T00:00:00`))} is
                missing. Request a correction from Attendance so HR can review it.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default EmployeeDashboard
