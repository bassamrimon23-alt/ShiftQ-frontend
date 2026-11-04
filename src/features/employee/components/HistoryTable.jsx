import { useMemo, useState } from 'react'
import { formatClock, formatHM, formatShortDate } from '../format'
import StatusBadge from './StatusBadge'
import { STATUS_OPTIONS } from './statusMeta'
import './employee.css'

const PAGE_SIZE = 8

function recordText(r) {
  const parts = [formatShortDate(r.date)]
  if (r.checkInAt) parts.push(formatClock(r.checkInAt))
  if (r.checkOutAt) parts.push(formatClock(r.checkOutAt))
  if (r.workedMinutes) parts.push(formatHM(r.workedMinutes))
  return parts.join(' · ')
}

// "Records" card: attendance history with month + status filters.
function HistoryTable({ history, loading }) {
  const [month, setMonth] = useState('')
  const [status, setStatus] = useState('')
  const [expanded, setExpanded] = useState(false)

  const rows = useMemo(
    () =>
      history.filter(
        (r) => (!month || r.date.startsWith(month)) && (!status || r.status === status)
      ),
    [history, month, status]
  )
  const visible = expanded ? rows : rows.slice(0, PAGE_SIZE)

  return (
    <section className="emp-card" aria-label="Attendance records">
      <div className="emp-card-head">
        <h2>Records</h2>
        <div className="emp-row">
          <input
            type="month"
            className="input"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Filter by month"
          />
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="emp-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="emp-muted">No attendance records match your filters.</p>
      ) : (
        <>
          <ul className="emp-records">
            {visible.map((r) => (
              <li className="emp-record" key={r.date}>
                <span className="emp-record-text">{recordText(r)}</span>
                <span className="emp-record-end">
                  {r.earlyExit && <span className="emp-tag">Early exit</span>}
                  {r.status === 'missing_checkout' && (
                    <span className="emp-correction">Correction needed</span>
                  )}
                  <StatusBadge status={r.status} />
                </span>
              </li>
            ))}
          </ul>
          {rows.length > PAGE_SIZE && (
            <button type="button" className="btn emp-more" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Show less' : `Show all ${rows.length} records`}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export default HistoryTable
