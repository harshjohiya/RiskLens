// Authentication Service Layer
import type { LoginCredentials, SignupCredentials, AuthResponse, User } from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "risklens_auth_token";
const USER_KEY = "risklens_user";

class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Invalid email or password",
      }));
      throw new Error(error.detail || "Authentication failed");
    }

    const data: AuthResponse = await response.json();
    this.setAuthData(data);
    return data;
  }

  // Sign up new user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Registration failed",
      }));
      throw new Error(error.detail || "Could not create account");
    }

    const data: AuthResponse = await response.json();
    this.setAuthData(data);
    return data;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get stored user
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  // Store auth data
  private setAuthData(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

export const authService = new AuthService();
