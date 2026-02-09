import { Navigate } from "react-router-dom";
import { authService } from "@/lib/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute - Protects routes requiring authentication
 * Redirects to /login if user is not authenticated
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
