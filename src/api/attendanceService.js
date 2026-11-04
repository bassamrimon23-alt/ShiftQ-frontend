import client from './client';

export const attendanceService = {
  // GET /attendance/today → { shift, record }
  getToday: () => client.get('/attendance/today').then((r) => r.data),

  // POST /attendance/verify-device → { trusted }
  verifyDevice: (deviceId) =>
    client.post('/attendance/verify-device', { deviceId }).then((r) => r.data),

  // POST /attendance/validate-location → { insideGeofence, distance }
  validateLocation: ({ lat, lng, accuracy }) =>
    client.post('/attendance/validate-location', { lat, lng, accuracy }).then((r) => r.data),

  // POST /attendance/validate-qr → { valid }
  validateQr: (qrToken) =>
    client.post('/attendance/validate-qr', { qrToken }).then((r) => r.data),

  // POST /attendance/check-in → AttendanceRecord   (الوقت بيتسجل من الـ Server)
  checkIn: ({ deviceId, location, qrToken }) =>
    client.post('/attendance/check-in', { deviceId, location, qrToken }).then((r) => r.data),

  // POST /attendance/check-out → AttendanceRecord
  checkOut: ({ deviceId, location, qrToken }) =>
    client.post('/attendance/check-out', { deviceId, location, qrToken }).then((r) => r.data),

  // GET /attendance/history?from&to&page → { items, page, pageSize, total }
  getHistory: (params) => client.get('/attendance/history', { params }).then((r) => r.data),
};
