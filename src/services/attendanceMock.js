// Standalone Mock Attendance API (demo data kept in memory + localStorage).
// Used as a fallback (VITE_ATTENDANCE_SOURCE=local) and for the shared constants/helpers.
// The function names and payloads follow the Sequence Diagrams, so this file can be
// swapped for the real API calls later without touching the screens:
//   checkIn()   -> POST /attendance/check-in   { deviceId, latitude, longitude, accuracy, qrToken }
//   checkOut()  -> POST /attendance/check-out  { deviceId, latitude, longitude, accuracy, qrToken }
//   getHistory  -> GET  /attendance/history
//
// The "Verification Service" step from the diagrams lives in verifyCheck().

export const SHIFT = {
  name: 'Morning Shift',
  start: '09:00',
  end: '17:00',
  breakMinutes: 30, // unpaid break (shown only, not deducted)
  graceMinutes: 10, // after start + grace => Late
  earlyMinutes: 15, // before start - early => Early
}

export const OFFICE = {
  name: 'Northstar Studio HQ',
  latitude: 27.1809, // same office as the API mock (src/api/mock/mockDb.js)
  longitude: 31.1837,
  radiusM: 150,
  maxAccuracyM: 100,
}

export const DEMO_QR_TOKEN = 'SHIFTIQ-DEMO-QR'

const WEEKEND_DAYS = [5, 6] // Friday, Saturday
const memory = {}

const storageKey = (userId) => `shiftq_attendance_${userId}`
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))
const pad = (n) => String(n).padStart(2, '0')

export class AttendanceError extends Error {
  constructor(code, message, extra = {}) {
    super(message)
    this.code = code
    Object.assign(this, extra)
  }
}

/* ---------- helpers ---------- */

export const toDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const atTime = (date, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

const minutesBetween = (a, b) =>
  Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000))

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const rad = (x) => (x * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Status is calculated from the shift + grace period (server side in the real system).
function computeStatus(checkInDate) {
  const diff = (checkInDate - atTime(checkInDate, SHIFT.start)) / 60000
  if (diff < -SHIFT.earlyMinutes) return 'early'
  if (diff <= SHIFT.graceMinutes) return 'on_time'
  return 'late'
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem('shiftq_device_id')
    if (!id) {
      id = `dev-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('shiftq_device_id', id)
    }
    return id
  } catch {
    return 'demo-device'
  }
}

// "Verification Service": accuracy -> geofence -> QR (same order as the diagram's alt cases).
function verifyCheck({ latitude, longitude, accuracy, qrToken }) {
  if (latitude == null || longitude == null) {
    throw new AttendanceError('no_location', 'Location is required.')
  }
  if (accuracy > OFFICE.maxAccuracyM) {
    throw new AttendanceError('low_accuracy', 'Location accuracy is too low.')
  }
  const distanceM = Math.round(
    distanceMeters(latitude, longitude, OFFICE.latitude, OFFICE.longitude)
  )
  if (distanceM > OFFICE.radiusM) {
    throw new AttendanceError('outside_area', 'Outside the allowed work area.', {
      distanceM,
    })
  }
  if (!qrToken || qrToken.trim().toUpperCase() !== DEMO_QR_TOKEN) {
    throw new AttendanceError('invalid_qr', 'QR code is invalid or expired.')
  }
  return { distanceM }
}

/* ---------- storage + seed data ---------- */

function buildRecord(date, inTime, outTime, status) {
  const checkInAt = inTime ? atTime(date, inTime) : null
  const checkOutAt = outTime ? atTime(date, outTime) : null
  return {
    date: toDateKey(date),
    status: status ?? (checkInAt ? computeStatus(checkInAt) : 'absent'),
    checkInAt: checkInAt ? checkInAt.toISOString() : null,
    checkOutAt: checkOutAt ? checkOutAt.toISOString() : null,
    workedMinutes: checkInAt && checkOutAt ? minutesBetween(checkInAt, checkOutAt) : 0,
    earlyExit: Boolean(checkOutAt && checkOutAt < atTime(date, SHIFT.end)),
    distanceM: checkInAt ? 20 : null,
  }
}

function seed() {
  // A mix of normal days, late arrival, early exit, missing check-out, absence and leave.
  const plan = [
    ['08:52', '17:04'],
    ['09:02', '17:00'],
    ['09:24', '17:12'],
    ['08:35', '17:30'],
    ['09:06', '16:15'],
    ['08:58', '17:01'],
    ['09:00', null, 'missing_checkout'],
    ['09:01', '17:03'],
    [null, null, 'absent'],
    ['08:49', '17:08'],
    [null, null, 'on_leave'],
    ['09:18', '17:05'],
  ]

  const records = []
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  let k = 0

  for (let i = 1; i <= 30; i += 1) {
    const d = new Date(day)
    d.setDate(day.getDate() - i)
    if (WEEKEND_DAYS.includes(d.getDay())) continue
    const [inTime, outTime, status] = plan[k % plan.length]
    records.push(buildRecord(d, inTime, outTime, status))
    k += 1
  }
  return records
}

function load(userId) {
  if (memory[userId]) return memory[userId]
  let records = null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw) records = JSON.parse(raw)
  } catch {
    records = null
  }
  memory[userId] = records ?? seed()
  return memory[userId]
}

function save(userId, records) {
  memory[userId] = records
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(records))
  } catch {
    // storage unavailable: the in-memory copy still works for this session
  }
}

/* ---------- API ---------- */

export async function getToday(userId) {
  await delay(250)
  const key = toDateKey(new Date())
  return load(userId).find((r) => r.date === key) ?? null
}

export async function getHistory(userId, { month = '', status = '' } = {}) {
  await delay(300)
  return load(userId)
    .filter((r) => (!month || r.date.startsWith(month)) && (!status || r.status === status))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getSummary(userId, month = toDateKey(new Date()).slice(0, 7)) {
  await delay(250)
  const rows = load(userId).filter((r) => r.date.startsWith(month))
  const count = (...statuses) => rows.filter((r) => statuses.includes(r.status)).length
  return {
    month,
    present: count('early', 'on_time', 'late'),
    late: count('late'),
    missingCheckout: count('missing_checkout'),
    absent: count('absent'),
    onLeave: count('on_leave'),
    workedMinutes: rows.reduce((sum, r) => sum + (r.workedMinutes || 0), 0),
  }
}

// Next working days with the standard shift (mock schedule for the dashboard).
export function getUpcomingShifts(count = 3) {
  const shifts = []
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  while (shifts.length < count) {
    day.setDate(day.getDate() + 1)
    if (WEEKEND_DAYS.includes(day.getDay())) continue
    shifts.push({
      date: toDateKey(day),
      day: new Date(day),
      start: SHIFT.start,
      end: SHIFT.end,
      location: OFFICE.name,
      status: 'Confirmed',
    })
  }
  return shifts
}

export async function checkIn(userId, payload) {
  await delay(700)
  const records = load(userId)
  const key = toDateKey(new Date())

  if (records.some((r) => r.date === key && r.checkInAt)) {
    throw new AttendanceError('duplicate', 'You already checked in today.')
  }

  const { distanceM } = verifyCheck(payload)
  const now = new Date()
  const record = {
    date: key,
    status: computeStatus(now),
    checkInAt: now.toISOString(),
    checkOutAt: null,
    workedMinutes: 0,
    earlyExit: false,
    distanceM,
  }
  save(userId, [...records.filter((r) => r.date !== key), record])
  return record
}

export async function checkOut(userId, payload) {
  await delay(700)
  const records = load(userId)
  const key = toDateKey(new Date())
  const active = records.find((r) => r.date === key && r.checkInAt && !r.checkOutAt)

  if (!active) {
    throw new AttendanceError('no_active_checkin', 'No active check-in found.')
  }

  verifyCheck(payload)
  const now = new Date()
  const updated = {
    ...active,
    checkOutAt: now.toISOString(),
    workedMinutes: minutesBetween(active.checkInAt, now),
    earlyExit: now < atTime(now, SHIFT.end),
  }
  save(userId, records.map((r) => (r.date === key ? updated : r)))
  return updated
}

// Demo helper: wipe the saved data and regenerate the sample history.
export async function resetDemoData(userId) {
  await delay(200)
  delete memory[userId]
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // ignore
  }
  load(userId)
}
