import api from './api'

export const habitService = {
  getHabits: () => api.get('/api/habits'),

  createHabit: (data) => api.post('/api/habits', data),

  updateHabit: (id, data) => api.put(`/api/habits/${id}`, data),

  deleteHabit: (id) => api.delete(`/api/habits/${id}`),

  toggleHabit: (id, date) => api.post(`/api/habits/${id}/toggle?date=${date}`),

  addNote: (id, date, note) => api.post(`/api/habits/${id}/note?date=${date}`, { note }),

  getMonthlyData: (month, year) => api.get(`/api/habits/monthly?month=${month}&year=${year}`),

  getStatistics: (month, year) => api.get(`/api/habits/statistics?month=${month}&year=${year}`),
}
