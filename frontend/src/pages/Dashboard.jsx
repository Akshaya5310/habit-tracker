import { useState, useEffect } from 'react'
import { habitService } from '../services/habitService'
import toast from 'react-hot-toast'
import Header from '../components/Header'
import HabitTrackerTable from '../components/HabitTrackerTable'
import AddHabitModal from '../components/AddHabitModal'

export default function Dashboard() {
  const [monthlyData, setMonthlyData] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ]

  useEffect(() => {
    fetchData()
  }, [currentMonth, currentYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [monthlyRes, statsRes] = await Promise.all([
        habitService.getMonthlyData(currentMonth, currentYear),
        habitService.getStatistics(currentMonth, currentYear),
      ])
      setMonthlyData(monthlyRes.data)
      setStatistics(statsRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (habitId, day) => {
    const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    try {
      const response = await habitService.toggleHabit(habitId, date)
      const { completed } = response.data

      // Update local state
      setMonthlyData(prev => {
        const newRecords = { ...prev.records }
        if (!newRecords[habitId]) newRecords[habitId] = {}
        newRecords[habitId] = { ...newRecords[habitId], [day]: completed }
        return { ...prev, records: newRecords }
      })

      // Update statistics
      setStatistics(prev => {
        if (!prev) return prev
        const totalHabits = prev.totalHabits
        const dailyStats = [...prev.dailyStats]
        const dayIndex = day - 1
        if (dayIndex < dailyStats.length) {
          const stat = { ...dailyStats[dayIndex] }
          if (completed) {
            stat.completed += 1
            stat.incomplete -= 1
          } else {
            stat.completed -= 1
            stat.incomplete += 1
          }
          stat.percentage = totalHabits > 0 ? Math.round((stat.completed * 100 / totalHabits) * 100) / 100 : 0
          dailyStats[dayIndex] = stat
        }
        return { ...prev, dailyStats }
      })
    } catch (error) {
      toast.error('Failed to update habit')
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const handleHabitAdded = () => {
    setShowAddModal(false)
    fetchData()
  }

  const handleHabitDeleted = async (habitId) => {
    try {
      await habitService.deleteHabit(habitId)
      toast.success('Habit deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  if (loading && !monthlyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              {monthNames[currentMonth - 1]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{currentYear}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="card px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Number of Habits</p>
              <p className="text-2xl font-bold text-center">{monthlyData?.habits?.length || 0}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="btn-secondary">← Prev</button>
              <button onClick={handleNextMonth} className="btn-secondary">Next →</button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              + Add Habit
            </button>
          </div>
        </div>

        {/* Habit Tracker Table */}
        {monthlyData && (
          <HabitTrackerTable
            monthlyData={monthlyData}
            statistics={statistics}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onToggle={handleToggle}
            onDelete={handleHabitDeleted}
          />
        )}
      </main>

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleHabitAdded}
        />
      )}
    </div>
  )
}
