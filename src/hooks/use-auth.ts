import { useState, useEffect } from "react";
import { authService } from "@/lib/authService.ts";
import type { User } from "@/types/auth";

/**
 * useAuth Hook
 * 
 * Provides authentication state and helpers throughout the application
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, logout } = useAuth();
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getUser();
    const authenticated = authService.isAuthenticated();
    
    setUser(currentUser);
    setIsAuthenticated(authenticated);
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
}
