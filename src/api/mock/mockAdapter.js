import { AxiosError } from 'axios';
import {
  USERS, SHIFT, OFFICE, todayStr,
  getTodayRecord, saveTodayRecord, listRecords,
  setRefreshCookie, getRefreshCookie, clearRefreshCookie,
} from './mockDb';

const LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY_MS || 400);
const ALWAYS_INSIDE = import.meta.env.VITE_MOCK_ALWAYS_INSIDE !== 'false';
const STRICT_GPS = import.meta.env.VITE_MOCK_STRICT_GPS === 'true';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class MockError extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const publicUser = ({ id, name, email, role, companyId }) => ({ id, name, email, role, companyId });

function authenticate(authHeader) {
  const token = authHeader && authHeader.replace('Bearer ', '');
  if (!token || !token.startsWith('mock-token-')) throw new MockError(401, 'TOKEN_EXPIRED');
  const user = USERS.find((u) => u.id === token.replace('mock-token-', ''));
  if (!user) throw new MockError(401, 'TOKEN_EXPIRED');
  return user;
}

function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// الـ Server هو اللي بيحدد الحالة (Early / On Time / Late)
function computeStatus(now) {
  const [h, m] = SHIFT.startTime.split(':').map(Number);
  const start = new Date(now);
  start.setHours(h, m, 0, 0);
  const diffMin = (now - start) / 60000;
  if (diffMin < -30) return 'early';
  if (diffMin <= SHIFT.gracePeriodMinutes) return 'on_time';
  return 'late';
}

// ---------------- Routes ----------------
const routes = [
  // ----- Auth -----
  {
    method: 'post', path: '/auth/login', public: true,
    handler: ({ body }) => {
      const user = USERS.find((u) => u.email === body.email && u.password === body.password);
      if (!user) throw new MockError(401, 'INVALID_CREDENTIALS');
      if (user.status === 'disabled') throw new MockError(403, 'ACCOUNT_DISABLED');
      setRefreshCookie(user.id);
      return { user: publicUser(user), accessToken: `mock-token-${user.id}`, deviceTrusted: true };
    },
  },
  {
    method: 'post', path: '/auth/refresh', public: true,
    handler: () => {
      const userId = getRefreshCookie();
      const user = USERS.find((u) => u.id === userId);
      if (!user) throw new MockError(401, 'SESSION_EXPIRED');
      return { user: publicUser(user), accessToken: `mock-token-${user.id}`, deviceTrusted: true };
    },
  },
  {
    method: 'post', path: '/auth/logout', public: true,
    handler: () => {
      clearRefreshCookie();
      return null;
    },
  },

  // ----- Attendance -----
  {
    method: 'get', path: '/attendance/today',
    handler: ({ user }) => ({ shift: SHIFT, record: getTodayRecord(user.id) }),
  },
  {
    method: 'post', path: '/attendance/verify-device',
    handler: ({ body }) => {
      if (body.deviceId === 'untrusted') throw new MockError(403, 'DEVICE_UNKNOWN');
      return { trusted: true };
    },
  },
  {
    method: 'post', path: '/attendance/validate-location',
    handler: ({ body }) => {
      if (STRICT_GPS && body.accuracy > 100) throw new MockError(422, 'LOW_ACCURACY');
      const distance = Math.round(distanceMeters(body, OFFICE));
      const inside = ALWAYS_INSIDE || distance <= OFFICE.radiusMeters;
      if (!inside) throw new MockError(403, 'OUTSIDE_GEOFENCE', { distance });
      return { insideGeofence: true, distance };
    },
  },
  {
    // للتجربة: اكتب EXPIRED أو INVALID في خانة الـ QR عشان تشوف الأخطاء
    method: 'post', path: '/attendance/validate-qr',
    handler: ({ body }) => {
      if (body.qrToken === 'EXPIRED') throw new MockError(400, 'QR_EXPIRED');
      if (body.qrToken === 'INVALID') throw new MockError(400, 'QR_INVALID');
      return { valid: true };
    },
  },
  {
    method: 'post', path: '/attendance/check-in',
    handler: ({ user, body }) => {
      const existing = getTodayRecord(user.id);
      if (existing && existing.checkInTime) throw new MockError(409, 'DUPLICATE_CHECKIN');
      const now = new Date();
      return saveTodayRecord(user.id, {
        id: `r-${Date.now()}`,
        employeeId: user.id,
        shiftId: SHIFT.id,
        date: todayStr(),
        checkInTime: now.toISOString(), // وقت الـ Server
        checkOutTime: null,
        workingDurationMinutes: null,
        status: computeStatus(now),
        confidenceScore: 92,
        suspicious: false,
        location: body.location,
      });
    },
  },
  {
    method: 'post', path: '/attendance/check-out',
    handler: ({ user }) => {
      const existing = getTodayRecord(user.id);
      if (!existing || !existing.checkInTime) throw new MockError(409, 'CHECKOUT_WITHOUT_CHECKIN');
      const now = new Date();
      return saveTodayRecord(user.id, {
        ...existing,
        checkOutTime: now.toISOString(),
        workingDurationMinutes: Math.round((now - new Date(existing.checkInTime)) / 60000),
      });
    },
  },
  {
    method: 'get', path: '/attendance/history',
    handler: ({ user }) => {
      const items = listRecords(user.id);
      return { items, page: 1, pageSize: items.length || 10, total: items.length };
    },
  },
];

// ---------------- Helpers ----------------
function makeResponse(config, status, data) {
  return { data, status, statusText: status === 200 ? 'OK' : 'Error', headers: {}, config, request: {} };
}

function makeError(config, status, data) {
  const response = makeResponse(config, status, data);
  return new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response
  );
}

// ---------------- Adapter ----------------
// axios بيناديها بدل ما يبعت request حقيقي
export async function mockAdapter(config) {
  await sleep(LATENCY);

  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0];
  const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  const authHeader = config.headers && (config.headers.get ? config.headers.get('Authorization') : config.headers.Authorization);

  const route = routes.find((r) => r.method === method && r.path === path);
  if (!route) {
    throw makeError(config, 404, { code: 'NOT_FOUND', message: `No mock for ${method.toUpperCase()} ${path}` });
  }

  try {
    const user = route.public ? null : authenticate(authHeader);
    const data = await route.handler({ body, user, config });
    return makeResponse(config, data === null ? 204 : 200, data);
  } catch (e) {
    if (e instanceof MockError) {
      throw makeError(config, e.status, { code: e.code, ...e.extra });
    }
    throw e;
  }
}
