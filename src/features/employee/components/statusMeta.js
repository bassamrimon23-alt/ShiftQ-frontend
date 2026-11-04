export const STATUS_META = {
  early: { label: 'Early', tone: 'green' },
  on_time: { label: 'On time', tone: 'green' },
  late: { label: 'Late', tone: 'amber' },
  absent: { label: 'Absent', tone: 'red' },
  on_leave: { label: 'On leave', tone: 'blue' },
  missing_checkout: { label: 'Missing check-out', tone: 'red' },
  not_checked_in: { label: 'Not checked in', tone: 'gray' },
}

export const STATUS_OPTIONS = Object.entries(STATUS_META)
  .filter(([key]) => key !== 'not_checked_in')
  .map(([value, { label }]) => ({ value, label }))

export const statusLabel = (status) => (STATUS_META[status] ?? STATUS_META.not_checked_in).label
