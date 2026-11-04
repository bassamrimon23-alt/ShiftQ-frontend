import { STATUS_META } from './statusMeta'
import './employee.css'

// `tone` is optional and overrides the default colour for the status.
function StatusBadge({ status, tone }) {
  const meta = STATUS_META[status] ?? STATUS_META.not_checked_in
  return <span className={`emp-badge emp-badge-${tone ?? meta.tone}`}>{meta.label}</span>
}

export default StatusBadge
