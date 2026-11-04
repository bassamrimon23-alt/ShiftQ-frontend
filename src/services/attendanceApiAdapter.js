// Adapter: connects the employee screens to the API layer in src/api (axios + Mock APIs).
//
// The screens use a simple shape ({ date, status, checkInAt, checkOutAt, workedMinutes, ... }).
// The API returns { checkInTime, checkOutTime, workingDurationMinutes, ... }.
// This file converts between the two, so the screens never change when the real
// Backend replaces the Mock (VITE_USE_MOCK=false in .env).
//
// Flow of a check-in / check-out (same order as the API flow):
//   verify-device -> validate-location -> validate-qr -> check-in | check-out
// The Backend must still validate everything again inside check-in / check-out.

import { attendanceService as api } from '../api/attendanceService'
import { authService } from '../api/authService'
import { session } from '../api/session'
import { USE_MOCK } from '../api/client'
import { AttendanceError, SHIFT, toDateKey } from './attendanceMock'

const MOCK_DB_KEY = 'mock_db_v1' // localStorage key used by src/api/mock/mockDb.js
const SEED_FLAG = 'shiftq_api_demo_seeded_v1'
const DEMO_USER_ID = 'u1' // employee@test.com in the mock
const WEEKEND_DAYS = [5, 6] // Friday, Saturday

/* ---------- session (demo bridge) ---------- */

// The Login page is not connected to src/api yet. While the Mock is on, sign in the demo
// employee automatically so the API calls are authorised. Remove once Login uses
// src/api/authService.js.
let sessionPromise = null
function ensureSession() {
  if (session.token) return Promise.resolve()
  if (!USE_MOCK) {
    return Promise.reject(new AttendanceError('session_expired', 'Please log in again.'))
  }
  if (!sessionPromise) {
    sessionPromise = authService
      .login({ email: 'employee@test.com', password: '123456' })
      .then((data) => {
        session.token = data.accessToken
      })
      .finally(() => {
        sessionPromise = null
      })
  }
  return sessionPromise
}

/* ---------- errors ---------- */

const CODE_MAP = {
  LOW_ACCURACY: 'low_accuracy',
  OUTSIDE_GEOFENCE: 'outside_area',
  QR_EXPIRED: 'invalid_qr',
  QR_INVALID: 'invalid_qr',
  DUPLICATE_CHECKIN: 'duplicate',
  CHECKOUT_WITHOUT_CHECKIN: 'no_active_checkin',
}

function toAttendanceError(e) {
  if (e instanceof AttendanceError) return e
  return new AttendanceError(
    CODE_MAP[e?.code] ?? e?.code ?? 'unknown',
    e?.message ?? 'Something went wrong. Please try again.'
  )
}

/* ---------- mapping ---------- */

function mapRecord(r) {
  const checkInAt = r.checkInTime ?? null
  const checkOutAt = r.checkOutTime ?? null
  const date = checkInAt ? toDateKey(new Date(checkInAt)) : r.date

  // A past day with a check-in but no check-out is a missing check-out.
  let status = r.status
  if (checkInAt && !checkOutAt && date < toDateKey(new Date())) status = 'missing_checkout'

  let earlyExit = false
  if (checkOutAt) {
    const out = new Date(checkOutAt)
    const [h, m] = SHIFT.end.split(':').map(Number)
    const end = new Date(out)
    end.setHours(h, m, 0, 0)
    earlyExit = out < end
  }

  return {
    date,
    status,
    checkInAt,
    checkOutAt,
    workedMinutes: r.workingDurationMinutes ?? 0,
    earlyExit,
    distanceM: r.location?.distance ?? null,
  }
}

/* ---------- demo history (Mock only) ---------- */

// The API mock only knows the records created by check-ins, so the history would be empty.
// On first use we add some earlier days to its storage so the Records list has data.
function seedDemoHistory() {
  if (!USE_MOCK) return
  try {
    if (localStorage.getItem(SEED_FLAG)) return
    const db = JSON.parse(localStorage.getItem(MOCK_DB_KEY)) || { records: {} }

    // [check-in, check-out, status] (status follows the mock rules: early before 08:30, late after 09:15)
    const plan = [
      ['08:52', '17:04', 'on_time'],
      ['09:02', '17:00', 'on_time'],
      ['09:24', '17:12', 'late'],
      ['08:25', '17:30', 'early'],
      ['09:06', '16:15', 'on_time'],
      ['08:58', '17:01', 'on_time'],
      ['09:00', null, 'on_time'], // missing check-out
      ['09:01', '17:03', 'on_time'],
      ['08:49', '17:08', 'on_time'],
      ['09:18', '17:05', 'late'],
    ]

    const base = new Date()
    base.setHours(0, 0, 0, 0)
    let k = 0
    for (let i = 1; i <= 30; i += 1) {
      const day = new Date(base)
      day.setDate(base.getDate() - i)
      if (WEEKEND_DAYS.includes(day.getDay())) continue

      const [inTime, outTime, status] = plan[k % plan.length]
      k += 1
      const at = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number)
        const d = new Date(day)
        d.setHours(h, m, 0, 0)
        return d
      }
      const inAt = at(inTime)
      const outAt = outTime ? at(outTime) : null
      const key = toDateKey(day)
      db.records[`${DEMO_USER_ID}:${key}`] = {
        id: `seed-${key}`,
        employeeId: DEMO_USER_ID,
        shiftId: 's1',
        date: key,
        checkInTime: inAt.toISOString(),
        checkOutTime: outAt ? outAt.toISOString() : null,
        workingDurationMinutes: outAt ? Math.round((outAt - inAt) / 60000) : null,
        status,
        confidenceScore: 92,
        suspicious: false,
        location: null,
      }
    }

    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db))
    localStorage.setItem(SEED_FLAG, '1')
  } catch {
    // storage unavailable: history simply stays empty
  }
}

/* ---------- API used by the screens ---------- */

export async function getToday() {
  await ensureSession()
  const { record } = await api.getToday()
  return record ? mapRecord(record) : null
}

export async function getHistory(userId, { month = '', status = '' } = {}) {
  await ensureSession()
  seedDemoHistory()
  const { items } = await api.getHistory({})
  return items
    .map(mapRecord)
    .filter((r) => (!month || r.date.startsWith(month)) && (!status || r.status === status))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getSummary(userId, month = toDateKey(new Date()).slice(0, 7)) {
  const rows = (await getHistory(userId)).filter((r) => r.date.startsWith(month))
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

async function runCheck(kind, { deviceId, latitude, longitude, accuracy, qrToken }) {
  try {
    await ensureSession()
    const location = { lat: latitude, lng: longitude, accuracy }
    await api.verifyDevice(deviceId)
    await api.validateLocation(location)
    await api.validateQr(qrToken)
    const payload = { deviceId, location, qrToken }
    const record = kind === 'in' ? await api.checkIn(payload) : await api.checkOut(payload)
    return mapRecord(record)
  } catch (e) {
    throw toAttendanceError(e)
  }
}

export const checkIn = (userId, payload) => runCheck('in', payload)
export const checkOut = (userId, payload) => runCheck('out', payload)

// Demo helper: wipe the Mock data and bring back the sample history.
export async function resetDemoData() {
  try {
    localStorage.removeItem(MOCK_DB_KEY)
    localStorage.removeItem(SEED_FLAG)
  } catch {
    // ignore
  }
}
