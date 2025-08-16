// Production authentication utilities
import type { User, Client } from "./types"

export interface AuthSession {
  user: User
  client: Client
  token: string
}

// Production authentication (replace with real auth service)
export const authApi = {
  async login(email: string, password: string): Promise<AuthSession | null> {
    // In production: verify credentials against database
    const mockUser: User = {
      id: "user-1",
      email,
      name: email.split("@")[0],
      role: "admin",
      clientId: "client-1",
      createdAt: new Date(),
    }

    const mockClient: Client = {
      id: "client-1",
      name: "Acme Corp",
      domain: "acme.com",
      apiKey: "ak_test_123456789",
      createdAt: new Date(),
      isActive: true,
    }

    const session: AuthSession = {
      user: mockUser,
      client: mockClient,
      token: `token_${Date.now()}`,
    }

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_session", JSON.stringify(session))
    }

    return session
  },

  async register(email: string, password: string, clientName: string): Promise<AuthSession | null> {
    // In production: create user and client in database
    const clientId = `client-${Date.now()}`

    const newClient: Client = {
      id: clientId,
      name: clientName,
      domain: email.split("@")[1] || "example.com",
      apiKey: `ak_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date(),
      isActive: true,
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: "admin",
      clientId,
      createdAt: new Date(),
    }

    // In production: INSERT INTO clients, users tables
    const session: AuthSession = {
      user: newUser,
      client: newClient,
      token: `token_${Date.now()}`,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_session", JSON.stringify(session))
    }

    return session
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_session")
    }
  },

  async getSession(): Promise<AuthSession | null> {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_session")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return null
        }
      }
    }
    return null
  },
}
