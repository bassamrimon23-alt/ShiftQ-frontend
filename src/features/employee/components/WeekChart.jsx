import { toDateKey } from '../../../services/attendanceService'
import { formatHM } from '../format'
import './employee.css'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MIN_SCALE_MINUTES = 600 // chart is at least 10h tall

// Hours worked for each day of the current week (Mon-Sun).
function WeekChart({ history, now }) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const todayKey = toDateKey(today)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const byDate = Object.fromEntries(history.map((r) => [r.date, r]))

  const days = DAY_LABELS.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = toDateKey(d)
    const record = byDate[key]
    let minutes = record?.workedMinutes ?? 0
    if (record?.checkInAt && !record.checkOutAt && key === todayKey) {
      minutes = Math.max(0, Math.round((now - new Date(record.checkInAt)) / 60000))
    }
    return { label, minutes }
  })

  const max = Math.max(MIN_SCALE_MINUTES, ...days.map((d) => d.minutes))
  const summary = days.map((d) => `${d.label} ${formatHM(d.minutes)}`).join(', ')

  return (
    <div className="emp-chart" role="img" aria-label={`Hours worked this week: ${summary}`}>
      <div className="emp-chart-plot">
        {days.map((d) => (
          <div className="emp-chart-col" key={d.label} title={`${d.label}: ${formatHM(d.minutes)}`}>
            <div
              className="emp-chart-bar"
              style={{ height: `${Math.max(2, (d.minutes / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="emp-chart-labels">
        {days.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export default WeekChart
