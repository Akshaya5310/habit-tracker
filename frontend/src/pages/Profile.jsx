import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Header from '../components/Header'
import { FiUser, FiMail, FiMoon, FiSun, FiLogOut } from 'react-icons/fi'

export default function Profile() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>

        <div className="card p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <FiUser className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiMail className="w-4 h-4" /> {user?.email}
              </p>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light mode</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
              <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}
