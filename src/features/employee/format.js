const pad = (n) => String(n).padStart(2, '0')

// 24h clock, e.g. 09:03
export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// 12h clock, e.g. 08:54 AM
export function formatClock(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// 05h 32m
export function formatHM(minutes) {
  if (minutes == null) return '—'
  return `${pad(Math.floor(minutes / 60))}h ${pad(minutes % 60)}m`
}

// Oct 24
export function formatShortDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Tue, 20 Oct
export function formatShiftDay(date) {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  const rest = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return `${weekday}, ${rest}`
}

// MONDAY, 19 OCTOBER
export function formatLongDay(date) {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  return `${weekday}, ${date.getDate()} ${month}`.toUpperCase()
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
