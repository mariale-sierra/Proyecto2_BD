import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '@/src/App'
import type { AppRole } from '@/src/auth/roles'
import { getDefaultRoute, canAccessPath } from '@/src/auth/roles'

interface RoleRouteProps {
  allowedRoles: AppRole[]
  children?: ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { authReady, employee } = useApp()
  const location = useLocation()

  if (!authReady) return null
  if (!employee) return <Navigate to="/" replace state={{ from: location }} />
  if (!allowedRoles.includes(employee.role)) {
    return <Navigate to={getDefaultRoute(employee.role)} replace />
  }

  return children ?? <Outlet />
}

export function HomeRedirect() {
  const { authReady, employee } = useApp()

  if (!authReady || !employee) return null

  const target = canAccessPath(employee.role, getDefaultRoute(employee.role))
    ? getDefaultRoute(employee.role)
    : '/'

  return <Navigate to={target} replace />
}