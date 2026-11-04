import { useCallback, useEffect, useState } from 'react'
import { getHistory, getSummary, getToday } from '../../services/attendanceService'

// Loads everything the employee attendance screens need.
export function useAttendanceData(userId) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    today: null,
    history: [],
    summary: null,
  })

  const reload = useCallback(async () => {
    try {
      const [today, history, summary] = await Promise.all([
        getToday(userId),
        getHistory(userId),
        getSummary(userId),
      ])
      setState({ loading: false, error: null, today, history, summary })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...state, reload }
}
