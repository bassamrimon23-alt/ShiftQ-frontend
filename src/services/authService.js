import { ROLES } from '../constants/roles'

const STORAGE_KEY = 'shiftq_user'

const DEMO_USERS = [
  { id: 1, name: 'Ahmed Khaled', email: 'admin@shiftq.com', password: '123456', role: ROLES.ADMIN },
  { id: 2, name: 'Mera Attalah', email: 'hr@shiftq.com', password: '123456', role: ROLES.HR },
  { id: 3, name: 'Gerges Nabil', email: 'employee@shiftq.com', password: '123456', role: ROLES.EMPLOYEE },
]

export async function login(email, password) {
  const found = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  )

  if (!found) {
    throw new Error('Invalid email or password')
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}
