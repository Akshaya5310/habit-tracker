import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiHome, FiGrid, FiBarChart2, FiUser, FiMoon, FiSun, FiLogOut } from 'react-icons/fi'

export default function Header() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/overview', label: 'Overview', icon: FiGrid },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HT</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">
              Habit Tracker
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 hover:text-red-600 dark:text-gray-400 transition-colors"
              aria-label="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
