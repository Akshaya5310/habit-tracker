import { useState } from 'react'
import { habitService } from '../services/habitService'
import toast from 'react-hot-toast'
import { FiX } from 'react-icons/fi'

const ICONS = ['✓', '🌅', '💧', '🏃', '🧘', '🥗', '🎯', '🧹', '📋', '📖', '📝', '💪', '🎨', '🎵', '💤']
const COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E8BAFF', '#FFD4BA', '#BAFFEE', '#FFC9DE']

export default function AddHabitModal({ onClose, onAdded }) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('✓')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await habitService.createHabit({ title: title.trim(), icon, color, frequency: 'daily' })
      toast.success('Habit created!')
      onAdded()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="card p-6 w-full max-w-md mx-4 animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Habit</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Wake Up Early"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    icon === i
                      ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500 scale-110'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
