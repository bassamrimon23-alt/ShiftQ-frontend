// "داتا بيس" وهمية بتتخزن في localStorage عشان تفضل بعد الـ refresh

export const USERS = [
  { id: 'u1', name: 'Ahmed Employee', email: 'employee@test.com', password: '123456', role: 'employee', companyId: 'c1', status: 'active' },
  { id: 'u2', name: 'Mona HR', email: 'hr@test.com', password: '123456', role: 'hr', companyId: 'c1', status: 'active' },
  { id: 'u3', name: 'Disabled User', email: 'disabled@test.com', password: '123456', role: 'employee', companyId: 'c1', status: 'disabled' },
];

export const SHIFT = {
  id: 's1',
  name: 'Morning Shift',
  startTime: '09:00',
  endTime: '17:00',
  gracePeriodMinutes: 15,
};

// موقع الشركة (غيّره لو عايز تجرب الـ geofence بجد)
export const OFFICE = { lat: 27.1809, lng: 31.1837, radiusMeters: 150 };

const KEY = 'mock_db_v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { records: {} };
  } catch {
    return { records: {} };
  }
}
function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export const todayStr = () => new Date().toISOString().slice(0, 10);
const recKey = (userId) => `${userId}:${todayStr()}`;

export function getTodayRecord(userId) {
  return load().records[recKey(userId)] || null;
}

export function saveTodayRecord(userId, record) {
  const db = load();
  db.records[recKey(userId)] = record;
  save(db);
  return record;
}

export function listRecords(userId) {
  const db = load();
  return Object.entries(db.records)
    .filter(([k]) => k.startsWith(`${userId}:`))
    .map(([, v]) => v)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// الـ "refresh cookie" الوهمي
const REFRESH_KEY = 'mock_refresh_user';
export const setRefreshCookie = (userId) => sessionStorage.setItem(REFRESH_KEY, userId);
export const getRefreshCookie = () => sessionStorage.getItem(REFRESH_KEY);
export const clearRefreshCookie = () => sessionStorage.removeItem(REFRESH_KEY);
