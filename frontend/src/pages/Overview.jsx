import { useState, useEffect } from 'react'
import { habitService } from '../services/habitService'
import Header from '../components/Header'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts'

export default function Overview() {
  const [monthlyData, setMonthlyData] = useState(null)
  const [statistics, setStatistics] = useState(null)
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

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  // Calculate summary
  const totalHabits = statistics?.totalHabits || 0
  const totalDays = monthlyData?.totalDays || 30
  const totalGoal = totalHabits * totalDays
  const totalCompleted = statistics?.dailyStats?.reduce((sum, s) => sum + s.completed, 0) || 0
  const overallPercentage = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0

  // Weekly progress
  const weeklyData = Object.entries(statistics?.weeklyCompletionRates || {}).map(([week, rate]) => ({
    week: parseInt(week),
    label: `Week ${week}`,
    rate: Math.round(rate),
  }))

  // Daily habit count chart data
  const dailyChartData = statistics?.dailyStats?.map(stat => ({
    day: stat.day,
    percentage: Math.round(stat.percentage),
  })) || []

  // Per-habit progress
  const habitProgress = monthlyData?.habits?.map(habit => {
    const records = monthlyData.records?.[habit.id] || {}
    const completed = Object.values(records).filter(v => v === true).length
    return { ...habit, completed, total: totalDays, percentage: Math.round((completed / totalDays) * 100) }
  }) || []

  const weekColors = ['#14B8A6', '#F59E0B', '#F97316', '#EC4899', '#6366F1']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Month Title & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              {monthNames[currentMonth - 1]}
            </h1>
            <p className="text-teal-600 dark:text-teal-400 font-semibold tracking-[0.3em] text-xs mt-2 uppercase">Habit Tracker • {currentYear}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 rounded-xl font-medium hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all shadow-sm">← Prev</button>
            <button onClick={handleNextMonth} className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md">Next →</button>
          </div>
        </div>

        {/* Summary + Weekly Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {/* Summary Card */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-100 to-transparent dark:from-teal-900/20 rounded-bl-full"></div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Summary</h3>
            <div className="flex items-center gap-3">
              <CircleProgress percentage={overallPercentage} size={64} color="#14B8A6" trackColor="#CCFBF1" />
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{totalCompleted}</p>
                <p className="text-[10px] font-bold text-teal-600 uppercase">Completed</p>
                <p className="text-lg font-bold text-gray-400 mt-1">{totalGoal}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Goal</p>
              </div>
            </div>
          </div>

          {/* Weekly Progress Rings */}
          {[1, 2, 3, 4, 5].map((week, idx) => {
            const weekData = weeklyData.find(w => w.week === week)
            const rate = weekData?.rate || 0
            const color = weekColors[idx]
            return (
              <div key={week} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at center, ${color}, transparent)` }}></div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>Week {week}</h3>
                <CircleProgress percentage={rate} size={68} color={color} trackColor={`${color}20`} />
                <p className="text-xl font-black text-gray-900 dark:text-white mt-2">{rate}%</p>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Progress Area Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Daily Completion</h3>
            <p className="text-xs text-gray-400 mb-4">Percentage of habits completed each day</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Area type="monotone" dataKey="percentage" stroke="#14B8A6" strokeWidth={2.5} fill="url(#colorTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Habit Progress Bars */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Habit Progress</h3>
            <p className="text-xs text-gray-400 mb-4">Individual habit completion this month</p>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
              {habitProgress.map((habit, idx) => {
                const barColor = HABIT_COLORS[idx % HABIT_COLORS.length]
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-28 truncate">{habit.title}</span>
                    <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${habit.percentage}%`,
                          background: `linear-gradient(90deg, ${barColor[0]}, ${barColor[1]})`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-14 text-right">{habit.completed}/{habit.total}</span>
                  </div>
                )
              })}
              {habitProgress.length === 0 && (
                <p className="text-gray-400 text-center py-8">No habits yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Habit Tracker Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 min-w-[150px]">
                    Habits
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 min-w-[70px]">
                    Goal
                  </th>
                  {getWeeks(totalDays, currentMonth, currentYear).map((week, idx) => (
                    <th
                      key={week.weekNum}
                      colSpan={week.days.length}
                      className="px-1 py-3 text-center text-xs font-bold border-b border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: `${weekColors[idx % weekColors.length]}15` }}
                    >
                      <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: weekColors[idx % weekColors.length] }}>
                        Week {week.weekNum}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 min-w-[130px]">
                    Progress
                  </th>
                </tr>
                {/* Day numbers */}
                <tr>
                  <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"></th>
                  <th className="border-b border-gray-200 dark:border-gray-700"></th>
                  {getWeeks(totalDays, currentMonth, currentYear).map((week, weekIdx) =>
                    week.days.map(({ day, dayName }) => (
                      <th key={day} className="px-0.5 py-1 text-center border-b border-gray-200 dark:border-gray-700">
                        <div className="text-[9px] text-gray-400 font-medium">{dayName}</div>
                        <div className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{day}</div>
                      </th>
                    ))
                  )}
                  <th className="border-b border-gray-200 dark:border-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {habitProgress.map((habit, idx) => {
                  const rowColor = weekColors[idx % weekColors.length]
                  return (
                    <tr key={habit.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{habit.icon || '📋'}</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{habit.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-sm font-bold border-b border-gray-100 dark:border-gray-700" style={{ color: rowColor }}>
                        {totalDays}
                      </td>
                      {getWeeks(totalDays, currentMonth, currentYear).map(week =>
                        week.days.map(({ day }) => {
                          const completed = monthlyData.records?.[habit.id]?.[day] === true
                          return (
                            <td key={day} className="px-0.5 py-1 text-center border-b border-gray-100 dark:border-gray-700">
                              <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all duration-200 ${
                                completed
                                  ? 'text-white shadow-sm'
                                  : 'border-2 border-gray-200 dark:border-gray-600'
                              }`} style={completed ? { backgroundColor: rowColor } : {}}>
                                {completed && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </td>
                          )
                        })
                      )}
                      <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${habit.percentage}%`,
                                backgroundColor: rowColor,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: rowColor }}>
                            {habit.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {habitProgress.length === 0 && (
                  <tr>
                    <td colSpan={100} className="text-center py-12 text-gray-400">
                      No habits yet. Add some from the Dashboard tab!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

// Gradient colors for habit progress bars
const HABIT_COLORS = [
  ['#14B8A6', '#2DD4BF'], // teal
  ['#F59E0B', '#FBBF24'], // amber
  ['#F97316', '#FB923C'], // orange
  ['#EC4899', '#F472B6'], // pink
  ['#6366F1', '#818CF8'], // indigo
  ['#10B981', '#34D399'], // emerald
  ['#EF4444', '#F87171'], // red
  ['#8B5CF6', '#A78BFA'], // violet
]

// Circle Progress Component
function CircleProgress({ percentage, size = 60, color = '#14B8A6', trackColor = '#E5E7EB' }) {
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  )
}

// Helper: get weeks
function getWeeks(totalDays, currentMonth, currentYear) {
  const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const result = []
  let weekNum = 1
  let dayStart = 1

  while (dayStart <= totalDays) {
    const dayEnd = Math.min(dayStart + 6, totalDays)
    const days = []
    for (let d = dayStart; d <= dayEnd; d++) {
      const date = new Date(currentYear, currentMonth - 1, d)
      days.push({ day: d, dayName: DAY_NAMES[date.getDay()] })
    }
    result.push({ weekNum, days })
    weekNum++
    dayStart = dayEnd + 1
  }
  return result
}
