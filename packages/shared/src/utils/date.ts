// Date utility functions

export const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const options: Intl.DateTimeFormatOptions = {}

  switch (format) {
    case 'short':
      options.month = 'short'
      options.day = 'numeric'
      break
    case 'medium':
      options.month = 'short'
      options.day = 'numeric'
      options.year = 'numeric'
      break
    case 'long':
      options.weekday = 'long'
      options.month = 'long'
      options.day = 'numeric'
      options.year = 'numeric'
      break
  }

  return date.toLocaleDateString('en-US', options)
}

export const formatTime = (date: Date, includeSeconds = false): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  }

  return date.toLocaleTimeString('en-US', options)
}

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date, 'medium')} ${formatTime(date)}`
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return formatDate(date, 'short')
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}
