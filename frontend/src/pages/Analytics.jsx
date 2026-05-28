import { useState, useEffect } from 'react'
import { habitService } from '../services/habitService'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899']

export default function Analytics() {
  const [statistics, setStatistics] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchData()
  }, [currentMonth, currentYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, monthlyRes] = await Promise.all([
        habitService.getStatistics(currentMonth, currentYear),
        habitService.getMonthlyData(currentMonth, currentYear),
      ])
      setStatistics(statsRes.data)
      setMonthlyData(monthlyRes.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const dailyProgressData = statistics?.dailyStats?.map(stat => ({
    day: stat.day,
    percentage: stat.percentage,
    completed: stat.completed,
    incomplete: stat.incomplete,
  })) || []

  const totalCompleted = statistics?.dailyStats?.reduce((sum, s) => sum + s.completed, 0) || 0
  const totalIncomplete = statistics?.dailyStats?.reduce((sum, s) => sum + s.incomplete, 0) || 0

  const pieData = [
    { name: 'Completed', value: totalCompleted },
    { name: 'Incomplete', value: totalIncomplete },
  ]

  const weeklyData = Object.entries(statistics?.weeklyCompletionRates || {}).map(([week, rate]) => ({
    week: `Week ${week}`,
    rate: rate,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics - {monthNames[currentMonth - 1]} {currentYear}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
                else setCurrentMonth(m => m - 1)
              }}
              className="btn-secondary"
            >← Prev</button>
            <button
              onClick={() => {
                if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
                else setCurrentMonth(m => m + 1)
              }}
              className="btn-secondary"
            >Next →</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Habits</p>
            <p className="text-3xl font-bold text-primary-600">{statistics?.totalHabits || 0}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Completion</p>
            <p className="text-3xl font-bold text-green-600">{statistics?.monthlyCompletionRate || 0}%</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Completed</p>
            <p className="text-3xl font-bold text-emerald-600">{totalCompleted}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Incomplete</p>
            <p className="text-3xl font-bold text-red-500">{totalIncomplete}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Progress Line Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Completed vs Incomplete</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Performance Bar Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#6366F1" name="Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Habit Streaks */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Habit Streaks 🔥</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {monthlyData?.habits?.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{habit.title}</span>
                  <span className="flex items-center gap-1 text-orange-500 font-bold">
                    🔥 {statistics?.habitStreaks?.[habit.id] || 0} days
                  </span>
                </div>
              ))}
              {(!monthlyData?.habits || monthlyData.habits.length === 0) && (
                <p className="text-gray-500 text-center py-8">No habits yet. Add some to see streaks!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
