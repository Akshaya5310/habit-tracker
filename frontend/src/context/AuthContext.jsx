import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { token, name, email: userEmail, userId } = response.data
    localStorage.setItem('token', token)
    const userData = { name, email: userEmail, userId }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return response.data
  }

  const register = async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password })
    const { token, name: userName, email: userEmail, userId } = response.data
    localStorage.setItem('token', token)
    const userData = { name: userName, email: userEmail, userId }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
