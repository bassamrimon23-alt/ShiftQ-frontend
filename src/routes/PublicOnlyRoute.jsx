import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from '../constants/roles'
import routesConfig from './routesConfig'

function PublicOnlyRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (user) {
    const from = location.state?.from?.pathname
    const canOpenFrom = routesConfig.some(
      (r) => r.path === from && r.allowedRoles.includes(user.role)
    )
    return <Navigate to={canOpenFrom ? from : ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
