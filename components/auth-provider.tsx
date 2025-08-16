"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { AuthSession } from "@/lib/auth"
import { authApi } from "@/lib/auth"

interface AuthContextType {
  session: AuthSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, clientName: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    authApi.getSession().then((existingSession) => {
      setSession(existingSession)
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const newSession = await authApi.login(email, password)
      if (newSession) {
        setSession(newSession)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, clientName: string): Promise<boolean> => {
    try {
      const newSession = await authApi.register(email, password, clientName)
      if (newSession) {
        setSession(newSession)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    await authApi.logout()
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
