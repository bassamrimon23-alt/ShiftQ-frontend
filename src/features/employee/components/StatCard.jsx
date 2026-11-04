import './employee.css'

// Small metric card with an icon chip, like the Attendance design.
function StatCard({ label, value, caption, icon, tone = 'blue' }) {
  return (
    <div className="emp-stat-card">
      <div className="emp-stat-top">
        <span className="emp-stat-label">{label}</span>
        <span className={`emp-chip emp-chip-${tone}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="emp-stat-value">{value}</div>
      <div className="emp-stat-caption">{caption}</div>
    </div>
  )
}

export default StatCard
