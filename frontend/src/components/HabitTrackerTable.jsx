import { useMemo, useState } from 'react'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'
import { habitService } from '../services/habitService'
import toast from 'react-hot-toast'

const WEEK_COLORS = [
  'bg-pastel-pink',
  'bg-pastel-blue',
  'bg-pastel-green',
  'bg-pastel-yellow',
  'bg-pastel-purple',
]

const WEEK_HEADER_COLORS = [
  'bg-pink-200 dark:bg-pink-900/40',
  'bg-blue-200 dark:bg-blue-900/40',
  'bg-green-200 dark:bg-green-900/40',
  'bg-yellow-200 dark:bg-yellow-900/40',
  'bg-purple-200 dark:bg-purple-900/40',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HabitTrackerTable({ monthlyData, statistics, currentMonth, currentYear, onToggle, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [noteModal, setNoteModal] = useState(null) // { habitId, day, note }
  const [noteText, setNoteText] = useState('')

  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear
  const todayDay = isCurrentMonth ? today.getDate() : -1

  const handleRenameStart = (habit) => {
    setEditingId(habit.id)
    setEditTitle(habit.title)
  }

  const handleRenameSubmit = async (habit) => {
    if (!editTitle.trim() || editTitle.trim() === habit.title) {
      setEditingId(null)
      return
    }
    try {
      await habitService.updateHabit(habit.id, {
        title: editTitle.trim(),
        color: habit.color,
        icon: habit.icon,
        frequency: habit.frequency,
        sortOrder: habit.sortOrder,
      })
      habit.title = editTitle.trim()
      toast.success('Habit renamed')
    } catch (error) {
      toast.error('Failed to rename habit')
    }
    setEditingId(null)
  }

  const handleNoteOpen = (e, habitId, day) => {
    e.preventDefault()
    const existingNote = monthlyData.notes?.[habitId]?.[day] || ''
    setNoteModal({ habitId, day })
    setNoteText(existingNote)
  }

  const handleNoteSave = async () => {
    if (!noteModal) return
    const { habitId, day } = noteModal
    const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    try {
      await habitService.addNote(habitId, date, noteText)
      // Update local state
      if (!monthlyData.notes) monthlyData.notes = {}
      if (!monthlyData.notes[habitId]) monthlyData.notes[habitId] = {}
      monthlyData.notes[habitId][day] = noteText
      toast.success('Note saved')
    } catch (error) {
      toast.error('Failed to save note')
    }
    setNoteModal(null)
  }

  // Group days into weeks
  const weeks = useMemo(() => {
    const totalDays = monthlyData.totalDays
    const result = []
    let weekNum = 1
    let dayStart = 1

    while (dayStart <= totalDays) {
      const dayEnd = Math.min(dayStart + 6, totalDays)
      const days = []
      for (let d = dayStart; d <= dayEnd; d++) {
        const date = new Date(currentYear, currentMonth - 1, d)
        days.push({
          day: d,
          dayName: DAY_NAMES[date.getDay()],
        })
      }
      result.push({ weekNum, days })
      weekNum++
      dayStart = dayEnd + 1
    }
    return result
  }, [monthlyData.totalDays, currentMonth, currentYear])

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            {/* Week headers */}
            <tr>
              <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[180px]">
                Daily Habits
              </th>
              {weeks.map((week, idx) => (
                <th
                  key={week.weekNum}
                  colSpan={week.days.length}
                  className={`border-b border-gray-200 dark:border-gray-700 px-2 py-2 text-center text-sm font-bold ${WEEK_HEADER_COLORS[idx % WEEK_HEADER_COLORS.length]}`}
                >
                  Week {week.weekNum}
                </th>
              ))}
            </tr>
            {/* Day name + number row */}
            <tr>
              <th className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-1 text-left text-xs text-gray-500 dark:text-gray-400">
                {/* empty */}
              </th>
              {weeks.map((week, weekIdx) =>
                week.days.map(({ day, dayName }) => (
                  <th
                    key={day}
                    className={`border-b border-gray-200 dark:border-gray-700 px-1 py-1 text-center text-xs font-medium ${
                      day === todayDay
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <div>{dayName}</div>
                    <div className="font-bold">{day}</div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {/* Habit rows */}
            {monthlyData.habits.map((habit, habitIdx) => (
              <tr key={habit.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.icon || '✓'}</span>
                      {editingId === habit.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRenameSubmit(habit)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(habit)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-primary-400 rounded px-1 py-0.5 outline-none w-28"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-pointer hover:text-primary-600"
                          onDoubleClick={() => handleRenameStart(habit)}
                        >
                          {habit.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleRenameStart(habit)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                        aria-label={`Rename ${habit.title}`}
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(habit.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        aria-label={`Delete ${habit.title}`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </td>
                {weeks.map((week, weekIdx) =>
                  week.days.map(({ day }) => {
                    const completed = monthlyData.records?.[habit.id]?.[day] === true
                    const hasNote = monthlyData.notes?.[habit.id]?.[day]
                    return (
                      <td
                        key={day}
                        className={`border-b border-gray-100 dark:border-gray-700/50 px-1 py-1 text-center ${
                          day === todayDay ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="relative group/cell">
                          <button
                            onClick={() => onToggle(habit.id, day)}
                            onContextMenu={(e) => handleNoteOpen(e, habit.id, day)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                              completed
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-300 dark:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40'
                            }`}
                            aria-label={`${habit.title} day ${day} ${completed ? 'completed' : 'incomplete'}`}
                            title={hasNote ? `📝 ${hasNote}` : 'Right-click to add note'}
                          >
                            {completed ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2" />
                              </svg>
                            )}
                          </button>
                          {hasNote && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white dark:border-gray-800"></div>
                          )}
                          {hasNote && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-30">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-[200px] whitespace-normal shadow-lg">
                                📝 {hasNote}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })
                )}
              </tr>
            ))}

            {/* Empty state */}
            {monthlyData.habits.length === 0 && (
              <tr>
                <td colSpan={monthlyData.totalDays + 1} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No habits yet. Click "Add Habit" to get started!
                </td>
              </tr>
            )}

            {/* Progress row */}
            {statistics && monthlyData.habits.length > 0 && (
              <>
                <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                  <td className="sticky left-0 z-10 bg-yellow-50 dark:bg-yellow-900/10 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Progress %
                  </td>
                  {weeks.map(week =>
                    week.days.map(({ day }) => {
                      const stat = statistics.dailyStats?.find(s => s.day === day)
                      const pct = stat?.percentage || 0
                      return (
                        <td key={day} className="border-b border-gray-200 dark:border-gray-700 px-1 py-2 text-center">
                          <span className={`text-xs font-bold ${
                            pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {pct > 0 ? `${Math.round(pct)}%` : '0%'}
                          </span>
                        </td>
                      )
                    })
                  )}
                </tr>
                <tr className="bg-green-50 dark:bg-green-900/10">
                  <td className="sticky left-0 z-10 bg-green-50 dark:bg-green-900/10 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    Complete
                  </td>
                  {weeks.map(week =>
                    week.days.map(({ day }) => {
                      const stat = statistics.dailyStats?.find(s => s.day === day)
                      return (
                        <td key={day} className="border-b border-gray-200 dark:border-gray-700 px-1 py-2 text-center text-xs font-medium text-green-600">
                          {stat?.completed || 0}
                        </td>
                      )
                    })
                  )}
                </tr>
                <tr className="bg-red-50 dark:bg-red-900/10">
                  <td className="sticky left-0 z-10 bg-red-50 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400">
                    Incomplete
                  </td>
                  {weeks.map(week =>
                    week.days.map(({ day }) => {
                      const stat = statistics.dailyStats?.find(s => s.day === day)
                      return (
                        <td key={day} className="border-gray-200 dark:border-gray-700 px-1 py-2 text-center text-xs font-medium text-red-500">
                          {stat?.incomplete || 0}
                        </td>
                      )
                    })
                  )}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setNoteModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Add Note</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Day {noteModal.day} — {monthlyData.habits.find(h => h.id === noteModal.habitId)?.title}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="e.g., Missed because of travel, Was sick today..."
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setNoteModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleNoteSave} className="btn-primary flex-1">Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
