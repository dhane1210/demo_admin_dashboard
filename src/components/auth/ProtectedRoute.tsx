import { Navigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY } from '../../constants'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Route guard that redirects unauthenticated users to the login page.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
