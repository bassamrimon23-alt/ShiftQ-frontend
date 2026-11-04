// Single entry point used by the employee screens.
//
// VITE_ATTENDANCE_SOURCE (see .env):
//   api   (default) -> the API layer in src/api (axios + Mock APIs, or the real Backend)
//   local           -> standalone mock in attendanceMock.js (no network layer)
//
// Constants and helpers come from attendanceMock.js in both modes. There is no API for the
// upcoming schedule yet, so getUpcomingShifts() is always the local demo schedule.

import * as local from './attendanceMock'
import * as api from './attendanceApiAdapter'

const impl = import.meta.env.VITE_ATTENDANCE_SOURCE === 'local' ? local : api

export {
  AttendanceError,
  DEMO_QR_TOKEN,
  OFFICE,
  SHIFT,
  getDeviceId,
  getUpcomingShifts,
  toDateKey,
} from './attendanceMock'

export const getToday = impl.getToday
export const getHistory = impl.getHistory
export const getSummary = impl.getSummary
export const checkIn = impl.checkIn
export const checkOut = impl.checkOut
export const resetDemoData = impl.resetDemoData
