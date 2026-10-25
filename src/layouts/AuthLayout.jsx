import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <h1>ShiftQ</h1>
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
