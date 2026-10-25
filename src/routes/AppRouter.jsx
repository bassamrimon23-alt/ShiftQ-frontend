import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from '../constants/roles'
import routesConfig from './routesConfig'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import PublicOnlyRoute from './PublicOnlyRoute'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Login from '../features/auth/Login'
import Unauthorized from '../features/shared/Unauthorized'
import NotFound from '../features/shared/NotFound'

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {routesConfig.map(({ path, component: Page, allowedRoles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <RoleRoute allowedRoles={allowedRoles}>
                    <Page />
                  </RoleRoute>
                }
              />
            ))}
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
